/**
 * Stylized SVG hero illustration used until the user uploads real student photos.
 * Two silhouetted students in green blazers with gold trim — matches the design
 * reference without requiring an image asset.
 */
export function HeroBackdrop() {
  return (
    <svg
      viewBox="0 0 320 260"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hbBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.94 0.04 110)" />
          <stop offset="100%" stopColor="oklch(0.9 0.05 110)" />
        </linearGradient>
        <linearGradient id="hbBlazer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.32 0.09 155)" />
          <stop offset="100%" stopColor="oklch(0.22 0.06 155)" />
        </linearGradient>
      </defs>
      <rect width="320" height="260" fill="url(#hbBg)" />
      {/* Faint school building */}
      <g opacity="0.15" fill="oklch(0.4 0.08 155)">
        <rect x="20" y="80" width="280" height="120" />
        <polygon points="20,80 160,30 300,80" />
        <rect x="150" y="120" width="20" height="80" fill="oklch(0.98 0.02 90)" />
      </g>
      {/* Left student */}
      <g transform="translate(70,60)">
        <circle cx="40" cy="35" r="26" fill="oklch(0.42 0.08 45)" />
        <path d="M14 65 L14 200 L66 200 L66 65 Q40 55 14 65Z" fill="url(#hbBlazer)" />
        <path d="M40 65 L40 200" stroke="oklch(0.9 0.05 90)" strokeWidth="6" />
        <path d="M28 70 L40 100 L52 70" fill="none" stroke="oklch(0.78 0.14 85)" strokeWidth="2" />
        <rect x="36" y="90" width="8" height="24" fill="oklch(0.78 0.14 85)" opacity="0.9" />
      </g>
      {/* Right student */}
      <g transform="translate(160,60)">
        <circle cx="45" cy="35" r="26" fill="oklch(0.38 0.07 45)" />
        {/* braids */}
        <path d="M25 40 Q18 70 24 90" stroke="oklch(0.25 0.03 45)" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M65 40 Q72 70 66 90" stroke="oklch(0.25 0.03 45)" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M18 65 L18 200 L72 200 L72 65 Q45 55 18 65Z" fill="url(#hbBlazer)" />
        <path d="M45 65 L45 200" stroke="oklch(0.9 0.05 90)" strokeWidth="6" />
        <path d="M33 70 L45 100 L57 70" fill="none" stroke="oklch(0.78 0.14 85)" strokeWidth="2" />
        <rect x="41" y="90" width="8" height="24" fill="oklch(0.78 0.14 85)" opacity="0.9" />
      </g>
    </svg>
  );
}
