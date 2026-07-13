import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SchoolLogo } from "@/components/school/Logo";
import { STATUS_LABELS } from "@/lib/school-options";
import { ArrowLeft, LogOut, Search, ShieldCheck, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — McDonalds International Schools" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type AppRow = {
  id: string;
  admission_number: string | null;
  status: string;
  student_first_name: string | null;
  student_last_name: string | null;
  applying_for_grade: string | null;
  email: string | null;
  phone_number: string | null;
  submitted_at: string | null;
  created_at: string;
};

const STATUSES = [
  "submitted","under_review","entrance_exam","interview",
  "provisionally_admitted","admission_offered","rejected",
] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<AppRow[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void reload();
  }, [isAdmin]);

  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("applications")
      .select("id, admission_number, status, student_first_name, student_last_name, applying_for_grade, email, phone_number, submitted_at, created_at")
      .neq("status", "draft")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as AppRow[]);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return [
        r.admission_number, r.student_first_name, r.student_last_name,
        r.email, r.phone_number, r.applying_for_grade,
      ].some((v) => v?.toLowerCase().includes(s));
    });
  }, [rows, q, statusFilter]);

  const stats = useMemo(() => {
    const c = (k: string) => rows.filter((r) => r.status === k).length;
    return {
      total: rows.length,
      pending: c("submitted") + c("under_review"),
      approved: c("admission_offered") + c("provisionally_admitted"),
      rejected: c("rejected"),
    };
  }, [rows]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("applications").update({ status } as any).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    void reload();
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const exportCsv = () => {
    const header = ["Admission No","First","Last","Grade","Status","Email","Phone","Submitted"];
    const csv = [header.join(",")].concat(
      filtered.map((r) => [
        r.admission_number, r.student_first_name, r.student_last_name,
        r.applying_for_grade, r.status, r.email, r.phone_number,
        r.submitted_at,
      ].map((v) => `"${(v ?? "").toString().replace(/"/g,'""')}"`).join(","))
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `applications-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (isAdmin === null) {
    return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <ShieldAlert className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 font-display text-2xl font-bold">Access denied</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account has no admin role. An administrator must grant access.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/" className="rounded-lg border border-input px-4 py-2 text-sm">Home</Link>
          <button onClick={signOut} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 pt-5 pb-16">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" aria-label="Back" className="grid size-10 place-items-center rounded-full text-primary hover:bg-accent">
              <ArrowLeft className="size-5" />
            </Link>
            <SchoolLogo />
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <LogOut className="size-4" /> Sign out
          </button>
        </header>

        <div className="mt-6 flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Admin Dashboard
          </h1>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: stats.total, tone: "primary" },
            { label: "Pending", value: stats.pending, tone: "gold" },
            { label: "Approved", value: stats.approved, tone: "success" },
            { label: "Rejected", value: stats.rejected, tone: "destructive" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, admission #, email…"
              className="w-full rounded-lg border border-input bg-card pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-input bg-card px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            onClick={exportCsv}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)]"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5">Admission No.</th>
                <th className="px-3 py-2.5">Applicant</th>
                <th className="px-3 py-2.5">Grade</th>
                <th className="px-3 py-2.5">Submitted</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No applications yet.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-mono text-xs text-primary">{r.admission_number}</td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-foreground">
                      {r.student_first_name} {r.student_last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </td>
                  <td className="px-3 py-2.5">{r.applying_for_grade}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">
                    {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Tip: to grant a staff member admin access, insert a row into <code>user_roles</code>
          {" "}with their user id and role <code>admin</code>.
        </p>
      </div>
    </div>
  );
}
