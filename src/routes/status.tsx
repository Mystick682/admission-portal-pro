import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ArrowLeft, Search, CheckCircle2, Circle, XCircle } from "lucide-react";
import { SchoolLogo } from "@/components/school/Logo";
import { fetchStatus } from "@/lib/application-api";
import { STATUS_LABELS, STATUS_STEPS } from "@/lib/school-options";

const search = z.object({ admno: z.string().optional().catch("") });

export const Route = createFileRoute("/status")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Check Admission Status — McDonalds International Schools" },
      {
        name: "description",
        content: "Look up your admission application by admission number.",
      },
    ],
  }),
  component: StatusPage,
});

function StatusPage() {
  const { admno } = Route.useSearch();
  const [query, setQuery] = useState(admno ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);

  const doSearch = async (q: string) => {
    if (!q) return;
    setLoading(true); setNotFound(false);
    try {
      const r = await fetchStatus(q.trim().toUpperCase());
      setResult(r); setNotFound(!r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admno) void doSearch(admno);
  }, [admno]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[430px] px-5 pt-5 pb-16 sm:max-w-lg">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="Back" className="grid size-10 place-items-center rounded-full text-primary hover:bg-accent">
            <ArrowLeft className="size-5" />
          </Link>
          <SchoolLogo />
          <span className="w-10" />
        </header>

        <h1 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
          Check Admission Status
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the admission number you received when you submitted your application.
        </p>

        <div className="mt-5 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
            placeholder="MIS-2026-XXXXXXXX"
            className="flex-1 rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={() => doSearch(query)}
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)] disabled:opacity-60"
          >
            <Search className="size-4" />
          </button>
        </div>

        {notFound && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            No application found with that admission number.
          </div>
        )}

        {result && <StatusCard row={result} />}
      </div>
    </div>
  );
}

function StatusCard({ row }: { row: Record<string, unknown> }) {
  const status = String(row.status ?? "");
  const isRejected = status === "rejected";
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        {row.photo_url ? (
          <img
            src={String(row.photo_url)}
            alt="Applicant"
            className="size-14 rounded-full object-cover ring-2 ring-primary/20"
          />
        ) : (
          <div className="grid size-14 place-items-center rounded-full bg-accent font-display text-lg font-bold text-primary">
            {String(row.student_first_name ?? "?").slice(0, 1)}
          </div>
        )}
        <div className="flex-1">
          <div className="font-display text-lg font-bold text-foreground">
            {String(row.student_first_name ?? "")} {String(row.student_last_name ?? "")}
          </div>
          <div className="text-xs text-muted-foreground">
            Applying for <span className="font-medium text-foreground">{String(row.applying_for_grade ?? "—")}</span>
          </div>
        </div>
        <span
          className={
            "rounded-full px-2.5 py-1 text-[11px] font-semibold " +
            (isRejected ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary")
          }
        >
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <div className="mt-3 rounded-lg bg-accent/60 p-3 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Admission No.</span>
          <span className="font-semibold text-foreground">{String(row.admission_number)}</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-muted-foreground">Submitted</span>
          <span className="font-semibold text-foreground">
            {row.submitted_at ? new Date(String(row.submitted_at)).toLocaleDateString() : "—"}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold text-foreground">Application timeline</div>
        <ol className="relative border-l-2 border-border pl-4">
          {STATUS_STEPS.map((s) => {
            const reached =
              status === s.key ||
              STATUS_STEPS.findIndex((x) => x.key === status) >
                STATUS_STEPS.findIndex((x) => x.key === s.key);
            const active = status === s.key;
            const Icon = reached ? CheckCircle2 : Circle;
            return (
              <li key={s.key} className="mb-3 last:mb-0">
                <span
                  className={
                    "absolute -left-[9px] grid size-4 place-items-center rounded-full " +
                    (reached ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")
                  }
                >
                  <Icon className="size-3" />
                </span>
                <div
                  className={
                    "text-xs " +
                    (active
                      ? "font-bold text-primary"
                      : reached
                      ? "font-medium text-foreground"
                      : "text-muted-foreground")
                  }
                >
                  {s.label}
                </div>
              </li>
            );
          })}
          {isRejected && (
            <li className="mb-0">
              <span className="absolute -left-[9px] grid size-4 place-items-center rounded-full bg-destructive text-destructive-foreground">
                <XCircle className="size-3" />
              </span>
              <div className="text-xs font-bold text-destructive">Not Successful</div>
            </li>
          )}
        </ol>
      </div>
    </div>
  );
}
