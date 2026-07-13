import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Search, Headphones, GraduationCap, Award, Users } from "lucide-react";
import { SchoolLogo } from "@/components/school/Logo";
import { HeroBackdrop } from "@/components/school/HeroBackdrop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "McDonalds International Schools — Admission Portal" },
      {
        name: "description",
        content:
          "Welcome to McDonalds International Schools. Apply for admission online, track your application status, and start your child's journey to excellence.",
      },
      { property: "og:title", content: "McDonalds International Schools" },
      {
        property: "og:description",
        content: "Apply for admission online and begin your child's journey to excellence.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[430px] pb-14 sm:max-w-2xl md:max-w-4xl">
        <header className="flex items-center justify-between px-5 pt-5">
          <SchoolLogo />
          <a
            href="mailto:admissions@mcdonaldsschools.com"
            className="flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <Headphones className="size-4" />
            <span className="hidden xs:inline">Need Help?</span>
          </a>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-3xl">
          <div className="grid grid-cols-[1.05fr_1fr] gap-2 px-5 pb-2">
            <div className="flex flex-col justify-center">
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-foreground">
                Admissions Open
              </span>
              <h1 className="font-display text-[30px] leading-[1.05] font-bold text-foreground sm:text-5xl">
                Begin Your Child's Journey to <span className="text-primary">Excellence</span>
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                A world-class education rooted in character, discipline, and academic excellence.
              </p>
            </div>
            <div className="relative -mr-5 aspect-[3/4] overflow-hidden rounded-2xl">
              <HeroBackdrop />
            </div>
          </div>
        </section>

        <section className="mx-5 mt-6 space-y-3">
          <Link
            to="/apply"
            search={{ step: 1 }}
            className="group flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-foreground shadow-[var(--shadow-button)] transition hover:brightness-110"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-primary-foreground/15">
              <ClipboardList className="size-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg font-bold">Apply Now</div>
              <div className="text-xs text-primary-foreground/80">
                Start a new admission application
              </div>
            </div>
            <ArrowRight className="size-5 transition group-hover:translate-x-0.5" />
          </Link>

          <Link
            to="/status"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:border-primary/30"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-accent">
              <Search className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg font-bold text-foreground">Check Status</div>
              <div className="text-xs text-muted-foreground">
                Track an existing application
              </div>
            </div>
            <ArrowRight className="size-5 text-primary transition group-hover:translate-x-0.5" />
          </Link>

          <a
            href="mailto:admissions@mcdonaldsschools.com"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition hover:border-primary/30"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-accent">
              <Headphones className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg font-bold text-foreground">Need Help?</div>
              <div className="text-xs text-muted-foreground">
                Speak with our admissions team
              </div>
            </div>
            <ArrowRight className="size-5 text-primary transition group-hover:translate-x-0.5" />
          </a>
        </section>

        <section className="mx-5 mt-8">
          <h2 className="font-display text-lg font-bold text-foreground">Why Our Families Choose Us</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { Icon: GraduationCap, label: "British Curriculum" },
              { Icon: Award, label: "Character First" },
              { Icon: Users, label: "Small Classes" },
            ].map(({ Icon, label }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-3 text-center">
                <Icon className="mx-auto size-5 text-primary" />
                <div className="mt-1.5 text-[11px] font-semibold leading-tight text-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="mx-5 mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} McDonalds International Schools
        </footer>
      </div>
    </div>
  );
}
