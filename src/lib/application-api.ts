import { supabase } from "@/integrations/supabase/client";
import { getDraftId, setDraftId } from "./application-storage";

export type ApplicationRow = {
  id: string;
  admission_number: string | null;
  status: string;
  [key: string]: unknown;
};

/** Ensure a draft application row exists and return its id. */
export async function ensureDraftApplication(): Promise<string> {
  const existing = getDraftId();
  if (existing) {
    const { data } = await supabase
      .from("applications")
      .select("id, status")
      .eq("id", existing)
      .maybeSingle();
    if (data && data.status === "draft") return data.id;
  }
  const { data, error } = await supabase
    .from("applications")
    .insert({})
    .select("id")
    .single();
  if (error) throw error;
  setDraftId(data.id);
  return data.id;
}

export async function loadDraft(id: string): Promise<ApplicationRow | null> {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as ApplicationRow | null) ?? null;
}

export async function saveDraft(id: string, patch: Record<string, unknown>) {
  const { error } = await supabase.from("applications").update(patch).eq("id", id);
  if (error) throw error;
}

export async function submitApplication(id: string): Promise<string> {
  const { data, error } = await supabase.rpc("submit_application", {
    _application_id: id,
  });
  if (error) throw error;
  return data as string;
}

export async function uploadPhoto(applicationId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${applicationId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("application-photos")
    .upload(path, file, { upsert: false });
  if (upErr) throw upErr;
  const { data: signed } = await supabase.storage
    .from("application-photos")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  return { path, url: signed?.signedUrl ?? "" };
}

export async function uploadDocument(
  applicationId: string,
  kind: string,
  file: File,
) {
  const ext = file.name.split(".").pop() ?? "pdf";
  const path = `${applicationId}/${kind}-${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("application-documents")
    .upload(path, file, { upsert: false });
  if (upErr) throw upErr;
  const { data: signed } = await supabase.storage
    .from("application-documents")
    .createSignedUrl(path, 60 * 60 * 24 * 365);
  const url = signed?.signedUrl ?? "";
  const { error: insErr } = await supabase.from("application_files").insert({
    application_id: applicationId,
    file_kind: kind,
    storage_path: path,
    public_url: url,
    file_name: file.name,
    size_bytes: file.size,
  });
  if (insErr) throw insErr;
  return { path, url };
}

export async function listFiles(applicationId: string) {
  const { data, error } = await supabase
    .from("application_files")
    .select("*")
    .eq("application_id", applicationId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchStatus(admissionNumber: string) {
  const { data, error } = await supabase.rpc("get_application_status", {
    _admission_number: admissionNumber,
  });
  if (error) throw error;
  const rows = data as Array<Record<string, unknown>>;
  return rows?.[0] ?? null;
}
