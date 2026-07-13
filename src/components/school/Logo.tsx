export function SchoolLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-[var(--shadow-button)]">
        {/* Book + graduation cap mark */}
        <svg viewBox="0 0 32 32" className="size-6 text-gold" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 22c4-2 8-2 12 0 4-2 8-2 12 0v-9c-4-2-8-2-12 0-4-2-8-2-12 0v9Z" fill="currentColor" opacity="0.9"/>
          <path d="M16 8l10 4-10 4L6 12l10-4Z" fill="currentColor"/>
          <path d="M22 14v4c0 1.5-2.7 3-6 3s-6-1.5-6-3v-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-display text-[15px] font-bold text-primary">McDonalds</div>
          <div className="text-[9px] font-semibold tracking-[0.14em] text-gold">INTERNATIONAL SCHOOLS</div>
        </div>
      )}
    </div>
  );
}
