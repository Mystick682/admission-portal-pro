import { Check } from "lucide-react";

export type StepIndex = 1 | 2 | 3 | 4;

const STEPS: { i: StepIndex; label: string }[] = [
  { i: 1, label: "Student\nInformation" },
  { i: 2, label: "Parent/Guardian\nDetails" },
  { i: 3, label: "Academic\nInformation" },
  { i: 4, label: "Review &\nSubmit" },
];

export function StepProgress({ active }: { active: StepIndex }) {
  return (
    <div className="flex items-start justify-between gap-1">
      {STEPS.map((s, idx) => {
        const isDone = s.i < active;
        const isActive = s.i === active;
        return (
          <div key={s.i} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div
                className={`h-px flex-1 ${idx === 0 ? "invisible" : ""} ${
                  s.i <= active ? "bg-primary" : "bg-border"
                }`}
              />
              <div
                className={[
                  "grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                ].join(" ")}
              >
                {isDone ? <Check className="size-4" strokeWidth={3} /> : s.i}
              </div>
              <div
                className={`h-px flex-1 ${idx === STEPS.length - 1 ? "invisible" : ""} ${
                  s.i < active ? "bg-primary" : "bg-border"
                }`}
              />
            </div>
            <div
              className={`mt-2 whitespace-pre-line text-center text-[11px] leading-tight ${
                isActive || isDone ? "font-semibold text-primary" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
