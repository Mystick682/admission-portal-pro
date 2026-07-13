import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, User, Users2, GraduationCap, ClipboardCheck, Pencil } from "lucide-react";
import { PortalShell } from "@/components/school/PortalShell";
import { Field, TextInput, SelectInput, TextArea } from "@/components/school/FormFields";
import { FileDrop } from "@/components/school/FileDrop";
import {
  ensureDraftApplication,
  loadDraft,
  saveDraft,
  submitApplication,
  uploadPhoto,
  uploadDocument,
  listFiles,
  type ApplicationRow,
} from "@/lib/application-api";
import { clearDraftId } from "@/lib/application-storage";
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  GRADE_OPTIONS,
  ADMISSION_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  NATIONALITY_OPTIONS,
  ACADEMIC_SESSION_OPTIONS,
} from "@/lib/school-options";
import type { StepIndex } from "@/components/school/StepProgress";

const searchSchema = z.object({
  step: z.coerce.number().int().min(1).max(4).catch(1),
});

export const Route = createFileRoute("/apply")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Apply Online — McDonalds International Schools" },
      {
        name: "description",
        content: "Complete your admission application in four simple steps.",
      },
    ],
  }),
  component: ApplyPage,
});

type FormState = Record<string, string>;

function ApplyPage() {
  const { step } = Route.useSearch();
  const navigate = useNavigate();
  const [appId, setAppId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [files, setFiles] = useState<Array<{ file_kind: string; file_name: string | null; public_url: string | null }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load / create draft
  useEffect(() => {
    void (async () => {
      try {
        const id = await ensureDraftApplication();
        setAppId(id);
        const row = (await loadDraft(id)) as ApplicationRow | null;
        if (row) {
          const asStrings: FormState = {};
          for (const [k, v] of Object.entries(row)) {
            if (v == null) continue;
            asStrings[k] = String(v);
          }
          setForm(asStrings);
          if (row.photo_url) {
            setPhotoUrl(String(row.photo_url));
            setPhotoName("Passport photograph");
          }
        }
        const fs = await listFiles(id);
        setFiles(fs);
      } catch (e) {
        console.error(e);
        toast.error("Couldn't load your application");
      }
    })();
  }, []);

  const update = useCallback((patch: FormState) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (!appId) return;
        try {
          const dbPatch: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(patch)) {
            dbPatch[k] = v === "" ? null : v;
          }
          await saveDraft(appId, dbPatch);
        } catch (e) {
          console.error("autosave failed", e);
        }
      }, 500);
      return next;
    });
  }, [appId]);

  const goToStep = (s: StepIndex) => navigate({ to: "/apply", search: { step: s } });

  const onNext = () => {
    if (step >= 4) return;
    goToStep((step + 1) as StepIndex);
  };
  const onBack = () => {
    if (step <= 1) {
      navigate({ to: "/" });
      return;
    }
    goToStep((step - 1) as StepIndex);
  };

  const onSubmitFinal = async () => {
    if (!appId) return;
    if (!form.certification_agreed && form.certification_agreed !== "true") {
      toast.error("Please certify the information is correct.");
      return;
    }
    setSubmitting(true);
    try {
      const admno = await submitApplication(appId);
      clearDraftId();
      navigate({ to: "/success", search: { admno } });
    } catch (e) {
      console.error(e);
      toast.error((e as Error).message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const stepMeta = [
    { icon: User, title: "Student Information", subtitle: "Please provide accurate information about the student." },
    { icon: Users2, title: "Parent / Guardian Details", subtitle: "Contact information for parents or guardians." },
    { icon: GraduationCap, title: "Academic Information", subtitle: "Academic history and supporting documents." },
    { icon: ClipboardCheck, title: "Review & Submit", subtitle: "Please review all details before submitting." },
  ][step - 1];

  const StepIcon = stepMeta.icon;

  return (
    <PortalShell activeStep={step as StepIndex}>
      <div className="mb-4 flex items-start gap-3 pt-2">
        <div className="grid size-10 place-items-center rounded-xl bg-accent">
          <StepIcon className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">{stepMeta.title}</h2>
          <p className="text-xs text-muted-foreground">{stepMeta.subtitle}</p>
        </div>
      </div>

      {step === 1 && (
        <Step1 form={form} update={update} photoUrl={photoUrl} photoName={photoName}
          onPhoto={async (file) => {
            if (!appId) return;
            const { url } = await uploadPhoto(appId, file);
            setPhotoUrl(url); setPhotoName(file.name);
            await saveDraft(appId, { photo_url: url });
          }} />
      )}
      {step === 2 && <Step2 form={form} update={update} />}
      {step === 3 && (
        <Step3
          form={form}
          update={update}
          files={files}
          onDoc={async (kind, file) => {
            if (!appId) return;
            await uploadDocument(appId, kind, file);
            const fs = await listFiles(appId);
            setFiles(fs);
          }}
        />
      )}
      {step === 4 && (
        <Step4
          form={form}
          files={files}
          agreed={form.certification_agreed === "true"}
          setAgreed={(v) => update({ certification_agreed: v ? "true" : "false" })}
          goToStep={goToStep}
        />
      )}

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-input bg-background px-5 py-3.5 text-sm font-semibold text-foreground transition hover:bg-accent"
        >
          <ArrowLeft className="mr-1 inline size-4" />
          {step === 1 ? "Cancel" : "Previous"}
        </button>
        {step < 4 ? (
          <button
            onClick={onNext}
            className="flex-1 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition hover:brightness-110"
          >
            Save &amp; Continue
            <ArrowRight className="ml-1 inline size-4" />
          </button>
        ) : (
          <button
            onClick={onSubmitFinal}
            disabled={submitting}
            className="flex-1 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        )}
      </div>
    </PortalShell>
  );
}

// ---------- STEPS ----------
type StepProps = { form: FormState; update: (p: FormState) => void };

function Step1({
  form, update, photoUrl, photoName, onPhoto,
}: StepProps & { photoUrl: string | null; photoName: string | null; onPhoto: (f: File) => Promise<void> }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="First Name" required>
        <TextInput placeholder="Enter first name" value={form.student_first_name ?? ""} onChange={(e) => update({ student_first_name: e.target.value })} />
      </Field>
      <Field label="Last Name" required>
        <TextInput placeholder="Enter last name" value={form.student_last_name ?? ""} onChange={(e) => update({ student_last_name: e.target.value })} />
      </Field>
      <Field label="Middle Name">
        <TextInput placeholder="Enter middle name" value={form.student_middle_name ?? ""} onChange={(e) => update({ student_middle_name: e.target.value })} />
      </Field>
      <Field label="Date of Birth" required>
        <TextInput type="date" value={form.date_of_birth ?? ""} onChange={(e) => update({ date_of_birth: e.target.value })} />
      </Field>
      <Field label="Gender" required>
        <SelectInput placeholder="Select gender" options={GENDER_OPTIONS} value={form.gender ?? ""} onChange={(e) => update({ gender: e.target.value })} />
      </Field>
      <Field label="Applying for Grade/Year" required>
        <SelectInput placeholder="Select grade/year" options={GRADE_OPTIONS} value={form.applying_for_grade ?? ""} onChange={(e) => update({ applying_for_grade: e.target.value })} />
      </Field>
      <Field label="Admission Type" required>
        <SelectInput placeholder="Select admission type" options={ADMISSION_TYPE_OPTIONS} value={form.admission_type ?? ""} onChange={(e) => update({ admission_type: e.target.value })} />
      </Field>
      <Field label="Academic Session" required>
        <SelectInput placeholder="Select session" options={ACADEMIC_SESSION_OPTIONS} value={form.academic_session ?? ""} onChange={(e) => update({ academic_session: e.target.value })} />
      </Field>
      <Field label="Nationality" required>
        <SelectInput placeholder="Select nationality" options={NATIONALITY_OPTIONS} value={form.nationality ?? ""} onChange={(e) => update({ nationality: e.target.value })} />
      </Field>
      <Field label="State of Origin">
        <TextInput placeholder="Enter state" value={form.state_of_origin ?? ""} onChange={(e) => update({ state_of_origin: e.target.value })} />
      </Field>
      <Field label="Local Government">
        <TextInput placeholder="Enter LGA" value={form.local_government ?? ""} onChange={(e) => update({ local_government: e.target.value })} />
      </Field>
      <Field label="Religion">
        <SelectInput placeholder="Select religion" options={RELIGION_OPTIONS} value={form.religion ?? ""} onChange={(e) => update({ religion: e.target.value })} />
      </Field>
      <Field label="Current School" hint="if applicable">
        <TextInput placeholder="Enter current school name" value={form.current_school ?? ""} onChange={(e) => update({ current_school: e.target.value })} />
      </Field>

      <div className="sm:col-span-2">
        <div className="mb-2">
          <div className="text-sm font-semibold text-foreground">Photo of Student</div>
          <div className="text-xs text-muted-foreground">Upload a recent passport photograph</div>
        </div>
        <FileDrop
          accept="image/jpeg,image/png,image/jpg"
          maxSizeMB={2}
          currentUrl={photoUrl}
          currentName={photoName}
          onFile={onPhoto}
        />
      </div>
    </div>
  );
}

function Step2({ form, update }: StepProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Father's Name" required>
        <TextInput placeholder="Full name" value={form.father_name ?? ""} onChange={(e) => update({ father_name: e.target.value })} />
      </Field>
      <Field label="Mother's Name" required>
        <TextInput placeholder="Full name" value={form.mother_name ?? ""} onChange={(e) => update({ mother_name: e.target.value })} />
      </Field>
      <Field label="Guardian's Name" hint="if different">
        <TextInput placeholder="Full name" value={form.guardian_name ?? ""} onChange={(e) => update({ guardian_name: e.target.value })} />
      </Field>
      <Field label="Relationship" required>
        <SelectInput placeholder="Select relationship" options={RELATIONSHIP_OPTIONS} value={form.guardian_relationship ?? ""} onChange={(e) => update({ guardian_relationship: e.target.value })} />
      </Field>
      <Field label="Occupation" required>
        <TextInput placeholder="Enter occupation" value={form.occupation ?? ""} onChange={(e) => update({ occupation: e.target.value })} />
      </Field>
      <Field label="Employer">
        <TextInput placeholder="Company name" value={form.employer ?? ""} onChange={(e) => update({ employer: e.target.value })} />
      </Field>
      <Field label="Phone Number" required>
        <TextInput type="tel" placeholder="+234 800 000 0000" value={form.phone_number ?? ""} onChange={(e) => update({ phone_number: e.target.value })} />
      </Field>
      <Field label="Alternative Phone">
        <TextInput type="tel" placeholder="+234 800 000 0000" value={form.alt_phone_number ?? ""} onChange={(e) => update({ alt_phone_number: e.target.value })} />
      </Field>
      <Field label="Email" required>
        <TextInput type="email" placeholder="name@example.com" value={form.email ?? ""} onChange={(e) => update({ email: e.target.value })} />
      </Field>
      <Field label="Country" required>
        <TextInput placeholder="Country" value={form.country ?? ""} onChange={(e) => update({ country: e.target.value })} />
      </Field>
      <Field label="State" required>
        <TextInput placeholder="State" value={form.state ?? ""} onChange={(e) => update({ state: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Residential Address" required>
          <TextArea rows={2} placeholder="Full residential address" value={form.residential_address ?? ""} onChange={(e) => update({ residential_address: e.target.value })} />
        </Field>
      </div>
      <Field label="Emergency Contact" required>
        <TextInput placeholder="Full name" value={form.emergency_contact ?? ""} onChange={(e) => update({ emergency_contact: e.target.value })} />
      </Field>
      <Field label="Emergency Number" required>
        <TextInput type="tel" placeholder="+234 800 000 0000" value={form.emergency_number ?? ""} onChange={(e) => update({ emergency_number: e.target.value })} />
      </Field>
    </div>
  );
}

const DOC_KINDS: { key: string; label: string; hint?: string }[] = [
  { key: "birth_certificate", label: "Birth Certificate", hint: "PDF, JPG (Max 5MB)" },
  { key: "medical", label: "Medical Report" },
  { key: "result", label: "Recent Results" },
  { key: "testimonial", label: "Testimonial" },
  { key: "transfer_letter", label: "Transfer Letter", hint: "If applicable" },
];

function Step3({
  form, update, files, onDoc,
}: StepProps & { files: Array<{ file_kind: string; file_name: string | null; public_url: string | null }>; onDoc: (kind: string, f: File) => Promise<void> }) {
  const has = (kind: string) => files.find((f) => f.file_kind === kind) ?? null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Current Class">
          <TextInput placeholder="Enter class" value={form.current_class ?? ""} onChange={(e) => update({ current_class: e.target.value })} />
        </Field>
        <Field label="Previous Class">
          <TextInput placeholder="Enter class" value={form.previous_class ?? ""} onChange={(e) => update({ previous_class: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Previous Schools">
            <TextArea rows={2} placeholder="List previous schools attended" value={form.previous_schools ?? ""} onChange={(e) => update({ previous_schools: e.target.value })} />
          </Field>
        </div>
        <Field label="Common Entrance Score">
          <TextInput placeholder="e.g. 250" value={form.common_entrance_score ?? ""} onChange={(e) => update({ common_entrance_score: e.target.value })} />
        </Field>
        <Field label="BECE Result">
          <TextInput placeholder="Grade / score" value={form.bece_result ?? ""} onChange={(e) => update({ bece_result: e.target.value })} />
        </Field>
        <Field label="WAEC Result">
          <TextInput placeholder="Grade / score" value={form.waec_result ?? ""} onChange={(e) => update({ waec_result: e.target.value })} />
        </Field>
        <Field label="NECO Result">
          <TextInput placeholder="Grade / score" value={form.neco_result ?? ""} onChange={(e) => update({ neco_result: e.target.value })} />
        </Field>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold text-foreground">Supporting Documents</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DOC_KINDS.map((d) => {
            const f = has(d.key);
            return (
              <div key={d.key}>
                <div className="mb-1 text-xs font-semibold text-foreground">{d.label}</div>
                <FileDrop
                  accept="image/*,application/pdf"
                  maxSizeMB={5}
                  hint={d.hint ?? "PDF, JPG or PNG"}
                  currentUrl={f?.public_url ?? null}
                  currentName={f?.file_name ?? null}
                  onFile={(file) => onDoc(d.key, file)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step4({
  form, files, agreed, setAgreed, goToStep,
}: {
  form: FormState;
  files: Array<{ file_kind: string; file_name: string | null }>;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
  goToStep: (s: StepIndex) => void;
}) {
  const rowsFor = (
    step: StepIndex,
    entries: [string, string][],
  ) => (
    <section className="rounded-xl border border-border bg-background/40 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-bold text-foreground">
          Step {step}: {["Student", "Parent/Guardian", "Academic"][step - 1]}
        </div>
        <button
          onClick={() => goToStep(step)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Pencil className="size-3" /> Edit
        </button>
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
        {entries.map(([label, key]) => (
          <div key={key} className="flex justify-between gap-2 text-xs sm:block">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium text-foreground sm:text-left">
              {form[key] || <span className="text-muted-foreground/60">—</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );

  return (
    <div className="space-y-4">
      {rowsFor(1, [
        ["First name", "student_first_name"],
        ["Last name", "student_last_name"],
        ["Date of birth", "date_of_birth"],
        ["Gender", "gender"],
        ["Grade", "applying_for_grade"],
        ["Session", "academic_session"],
        ["Admission type", "admission_type"],
        ["Nationality", "nationality"],
      ])}
      {rowsFor(2, [
        ["Father", "father_name"],
        ["Mother", "mother_name"],
        ["Guardian", "guardian_name"],
        ["Relationship", "guardian_relationship"],
        ["Phone", "phone_number"],
        ["Email", "email"],
        ["Address", "residential_address"],
        ["Emergency contact", "emergency_contact"],
      ])}
      {rowsFor(3, [
        ["Current class", "current_class"],
        ["Previous class", "previous_class"],
        ["Common Entrance", "common_entrance_score"],
        ["BECE", "bece_result"],
        ["WAEC", "waec_result"],
        ["NECO", "neco_result"],
      ])}

      <section className="rounded-xl border border-border bg-background/40 p-4">
        <div className="mb-2 text-sm font-bold text-foreground">Uploaded documents</div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {files.length === 0 && <li>No documents uploaded.</li>}
          {files.map((f) => (
            <li key={f.file_kind}>
              <span className="font-medium text-foreground capitalize">
                {f.file_kind.replace(/_/g, " ")}
              </span>
              {" — "}
              {f.file_name}
            </li>
          ))}
        </ul>
      </section>

      <label className="flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/[0.04] p-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 size-4 rounded border-input accent-primary"
        />
        <span className="text-xs text-foreground">
          I certify the information supplied above is complete and correct to the best of my
          knowledge. I understand that any false statement may result in withdrawal of admission.
        </span>
      </label>
    </div>
  );
}
