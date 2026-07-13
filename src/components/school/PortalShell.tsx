import { Link } from "@tanstack/react-router";
import { ArrowLeft, Headphones } from "lucide-react";
import { SchoolLogo } from "./Logo";
import { HeroBackdrop } from "./HeroBackdrop";
import { StepProgress, type StepIndex } from "./StepProgress";
import { BottomNav } from "./BottomNav";
import type { ReactNode } from "react";

interface PortalShellProps {
  children: ReactNode;
  backTo?: string;
  showHero?: boolean;
  activeStep?: StepIndex;
  hideStepper?: boolean;
  hideBottomNav?: boolean;
  heroTitle?: ReactNode;
  heroSubtitle?: ReactNode;
}

/**
 * The persistent chrome around every admission-portal page:
 * header · hero · stepper · [page content] · bottom nav.
 * Only children change between routes; everything else stays visually identical.
 */
export function PortalShell({
  children,
  backTo = "/",
  showHero = true,
  activeStep,
  hideStepper,
  hideBottomNav,
  heroTitle,
  heroSubtitle,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[430px] pb-24 sm:max-w-2xl md:max-w-4xl lg:max-w-5xl">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-5">
          <Link
            to={backTo}
            aria-label="Back"
            className="grid size-10 place-items-center rounded-full text-primary transition hover:bg-accent"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <SchoolLogo />
          <a
            href="mailto:admissions@mcdonaldsschools.com"
            className="flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <Headphones className="size-4" />
            <span className="hidden xs:inline">Need Help?</span>
          </a>
        </header>

        {/* Hero */}
        {showHero && (
          <section className="relative mt-5 overflow-hidden rounded-b-3xl">
            <div className="relative grid grid-cols-[1.1fr_1fr] gap-2 px-5 pb-6">
              <div className="flex flex-col justify-center">
                <h1 className="font-display text-[28px] leading-[1.1] font-bold text-foreground sm:text-4xl">
                  {heroTitle ?? (
                    <>
                      Begin Your Child's <br className="hidden sm:block" />
                      Journey to <span className="text-primary">Excellence</span>
                    </>
                  )}
                </h1>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {heroSubtitle ??
                    "Please complete the application form below to get started with the admission process."}
                </p>
              </div>
              <div className="relative -mr-5 aspect-[3/4] overflow-hidden rounded-2xl">
                <HeroBackdrop />
              </div>
            </div>
          </section>
        )}

        {/* Stepper */}
        {!hideStepper && activeStep && (
          <div className="mx-5 mt-4 rounded-t-2xl bg-card px-4 pt-6 pb-2 shadow-[var(--shadow-card)]">
            <StepProgress active={activeStep} />
          </div>
        )}

        {/* Content */}
        <main
          className={
            !hideStepper && activeStep
              ? "mx-5 rounded-b-2xl bg-card px-5 pt-2 pb-6 shadow-[var(--shadow-card)]"
              : "mx-5 mt-4 rounded-2xl bg-card px-5 py-6 shadow-[var(--shadow-card)]"
          }
        >
          {children}
        </main>
      </div>

      {!hideBottomNav && <BottomNav active={activeStep} />}
    </div>
  );
}
