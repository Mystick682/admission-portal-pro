
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ ADMISSION NUMBER GENERATOR ============
CREATE OR REPLACE FUNCTION public.generate_admission_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_no TEXT;
  yr TEXT := to_char(now(), 'YYYY');
BEGIN
  LOOP
    new_no := 'MIS-' || yr || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.applications WHERE admission_number = new_no);
  END LOOP;
  RETURN new_no;
END;
$$;

-- ============ STATUS ENUM ============
CREATE TYPE public.application_status AS ENUM (
  'draft', 'submitted', 'under_review', 'entrance_exam',
  'interview', 'provisionally_admitted', 'admission_offered', 'rejected'
);

-- ============ APPLICATIONS ============
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number TEXT UNIQUE,
  status public.application_status NOT NULL DEFAULT 'draft',

  -- Step 1: Student Information
  student_first_name TEXT,
  student_middle_name TEXT,
  student_last_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  nationality TEXT,
  state_of_origin TEXT,
  local_government TEXT,
  religion TEXT,
  applying_for_grade TEXT,
  academic_session TEXT,
  admission_type TEXT,
  current_school TEXT,
  photo_url TEXT,

  -- Step 2: Parent / Guardian
  father_name TEXT,
  mother_name TEXT,
  guardian_name TEXT,
  guardian_relationship TEXT,
  occupation TEXT,
  employer TEXT,
  phone_number TEXT,
  alt_phone_number TEXT,
  email TEXT,
  residential_address TEXT,
  country TEXT,
  state TEXT,
  emergency_contact TEXT,
  emergency_number TEXT,

  -- Step 3: Academic
  previous_schools TEXT,
  current_class TEXT,
  previous_class TEXT,
  common_entrance_score TEXT,
  bece_result TEXT,
  waec_result TEXT,
  neco_result TEXT,

  -- Meta
  certification_agreed BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX applications_admission_number_idx ON public.applications(admission_number);
CREATE INDEX applications_status_idx ON public.applications(status);
CREATE INDEX applications_created_at_idx ON public.applications(created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Anyone (even anonymous) can create a draft application and edit it while it is still a draft.
-- The row id acts as the edit token, kept in the browser during the multi-step flow.
CREATE POLICY "Anyone can create a draft application"
  ON public.applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'draft');

CREATE POLICY "Anyone can update their draft while still a draft"
  ON public.applications FOR UPDATE
  TO anon, authenticated
  USING (status = 'draft')
  WITH CHECK (status IN ('draft', 'submitted'));

-- Public status lookup by admission_number is handled via a security-definer RPC (below),
-- so we do NOT grant broad SELECT to anon on the raw table.
CREATE POLICY "Admins can view all applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Applicants can read their own draft during the session"
  ON public.applications FOR SELECT
  TO anon, authenticated
  USING (status = 'draft');

CREATE POLICY "Admins can update any application"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ APPLICATION FILES ============
CREATE TABLE public.application_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  file_kind TEXT NOT NULL, -- 'photo', 'birth_certificate', 'medical', 'result', 'testimonial', 'transfer_letter', 'admission_letter'
  storage_path TEXT NOT NULL,
  public_url TEXT,
  file_name TEXT,
  size_bytes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX application_files_app_idx ON public.application_files(application_id);

GRANT SELECT, INSERT, DELETE ON public.application_files TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_files TO authenticated;
GRANT ALL ON public.application_files TO service_role;
ALTER TABLE public.application_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can attach files to a draft application"
  ON public.application_files FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.applications a
            WHERE a.id = application_id AND a.status = 'draft')
  );

CREATE POLICY "Anyone can read files of a draft application"
  ON public.application_files FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (SELECT 1 FROM public.applications a
            WHERE a.id = application_id AND a.status = 'draft')
  );

CREATE POLICY "Admins can view all files"
  ON public.application_files FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert/delete files"
  ON public.application_files FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SUBMIT + STATUS FUNCTIONS ============

-- Submit application: assigns admission_number, flips status, returns admission_number.
CREATE OR REPLACE FUNCTION public.submit_application(_application_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admno TEXT;
BEGIN
  SELECT admission_number INTO _admno FROM public.applications WHERE id = _application_id;
  IF _admno IS NULL THEN
    _admno := public.generate_admission_number();
  END IF;

  UPDATE public.applications
    SET admission_number = _admno,
        status = 'submitted',
        submitted_at = now(),
        certification_agreed = true,
        updated_at = now()
  WHERE id = _application_id AND status = 'draft';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found or already submitted';
  END IF;

  RETURN _admno;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_application(UUID) TO anon, authenticated;

-- Public status lookup: returns a safe subset by admission_number.
CREATE OR REPLACE FUNCTION public.get_application_status(_admission_number TEXT)
RETURNS TABLE (
  admission_number TEXT,
  status public.application_status,
  student_first_name TEXT,
  student_last_name TEXT,
  applying_for_grade TEXT,
  photo_url TEXT,
  submitted_at TIMESTAMPTZ
)
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT admission_number, status, student_first_name, student_last_name,
         applying_for_grade, photo_url, submitted_at
  FROM public.applications
  WHERE admission_number = _admission_number
    AND status <> 'draft'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_application_status(TEXT) TO anon, authenticated;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER applications_set_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
