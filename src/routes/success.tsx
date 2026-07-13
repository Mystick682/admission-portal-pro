import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, Copy, Home, Printer, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { SchoolLogo } from "@/components/school/Logo";

const search = z.object({ admno: z.string().catch("") });

export const Route = createFileRoute("/success")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Application Submitted — McDonalds International Schools" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { admno } = Route.useSearch();
  const navigate = useNavigate();

  const copy = async () => {
    await navigator.clipboard.writeText(admno);
    toast.success("Copied admission number");
  };

  if (!admno) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p>No application reference found.</p>
        <Link to="/" className="text-primary underline">Return home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[430px] px-5 pt-6 pb-10 sm:max-w-lg">
        <div className="flex justify-center">
          <SchoolLogo />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mt-8 flex flex-col items-center text-center"
        >
          <div className="grid size-24 place-items-center rounded-full bg-success/15">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 260 }}
            >
              <CheckCircle2 className="size-14 text-success" strokeWidth={2} />
            </motion.div>
          </div>

          <h1 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Application Submitted Successfully
          </h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Thank you. We've received your application and will be in touch shortly. Save your
            admission number below to check your status at any time.
          </p>
        </motion.div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-center shadow-[var(--shadow-card)]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your Admission Number
          </div>
          <div className="mt-1 font-display text-2xl font-bold tracking-wider text-primary">
            {admno}
          </div>
          <button
            onClick={copy}
            className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-primary hover:bg-accent/80"
          >
            <Copy className="size-3.5" />
            Copy
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={() => window.print()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent"
          >
            <Printer className="size-4" />
            Print confirmation
          </button>
          <button
            onClick={() => navigate({ to: "/status", search: { admno } })}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-button)]"
          >
            <Search className="size-4" />
            Check admission status
          </button>
          <Link
            to="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-primary hover:bg-accent"
          >
            <Home className="size-4" />
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
