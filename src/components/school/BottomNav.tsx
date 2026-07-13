import { Link } from "@tanstack/react-router";
import type { StepIndex } from "./StepProgress";

const ITEMS: { i: StepIndex; label: string }[] = [
  { i: 1, label: "Student Info" },
  { i: 2, label: "Parent Details" },
  { i: 3, label: "Academic Info" },
  { i: 4, label: "Review & Submit" },
];

export function BottomNav({ active }: { active?: StepIndex }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[430px] items-start justify-between px-4 py-3 sm:max-w-2xl">
        {ITEMS.map((it) => {
          const isActive = it.i === active;
          return (
            <Link
              key={it.i}
              to="/apply"
              search={{ step: it.i }}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <span
                className={[
                  "grid size-7 place-items-center rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {it.i}
              </span>
              <span
                className={`text-[10.5px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
