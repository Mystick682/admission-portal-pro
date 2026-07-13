
-- Allow anonymous uploads to the two application buckets
CREATE POLICY "Anyone can upload to application-photos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'application-photos');

CREATE POLICY "Anyone can read application-photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'application-photos');

CREATE POLICY "Anyone can upload to application-documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'application-documents');

CREATE POLICY "Anyone can read application-documents"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'application-documents');

CREATE POLICY "Admins can delete application files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('application-photos', 'application-documents')
    AND public.has_role(auth.uid(), 'admin')
  );
