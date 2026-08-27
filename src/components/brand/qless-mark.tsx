type QlessMarkProps = {
  className?: string;
  variant?: "color" | "light";
};

/**
 * Abstract mark inspired by the DigiPin Technology logo: two interlocking
 * hexagonal rings (blue -> green gradient) with a checkmark at the join,
 * standing in for "a queue, resolved."
 */
export function QlessMark({ className, variant = "color" }: QlessMarkProps) {
  const gradientId = "qless-mark-gradient";
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="2" y1="6" x2="46" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E88E5" />
          <stop offset="45%" stopColor="#1565C0" />
          <stop offset="60%" stopColor="#2E7D32" />
          <stop offset="100%" stopColor="#4CB968" />
        </linearGradient>
      </defs>
      <path
        d="M16 5.5 4 12.3v13.6l12 6.8 12-6.8V12.3L16 5.5Z"
        stroke={variant === "light" ? "#ffffff" : `url(#${gradientId})`}
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
        opacity={variant === "light" ? 0.9 : 1}
      />
      <path
        d="M32 15.5 20 22.3v13.6l12 6.8 12-6.8V22.3L32 15.5Z"
        stroke={variant === "light" ? "#ffffff" : `url(#${gradientId})`}
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M13 22.5 17.5 27 27 16"
        stroke={variant === "light" ? "#ffffff" : `url(#${gradientId})`}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
