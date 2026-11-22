export function AppLogo({
  size = 20,
  color = "currentColor",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden="true"
    >
      {/* Owl silhouette with signature ear tufts and contoured body */}
      <path
        d="M4.5 5.2L7.6 7.6C9.2 7 14.8 7 16.4 7.6L19.5 5.2C21.2 8.8 21.4 15.2 18.2 19.2C15.2 22 8.8 22 5.8 19.2C2.6 15.2 2.8 8.8 4.5 5.2Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Owl Brow line */}
      <path
        d="M5.5 8.2C8 9.3 11 9.3 12 11.2C13 9.3 16 9.3 18.5 8.2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left Owl Eye (Intelligent, alert pupil) */}
      <circle
        cx="8.5"
        cy="12.2"
        r="2.8"
        stroke={color}
        strokeWidth="1.5"
      />
      <circle
        cx="8.5"
        cy="12.2"
        r="1.25"
        fill={color}
      />

      {/* Right Owl Eye */}
      <circle
        cx="15.5"
        cy="12.2"
        r="2.8"
        stroke={color}
        strokeWidth="1.5"
      />
      <circle
        cx="15.5"
        cy="12.2"
        r="1.25"
        fill={color}
      />

      {/* Sleek triangular beak */}
      <path
        d="M10.8 13.8H13.2L12 16.5Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {/* Lower chest plumage / financial balance curve */}
      <path
        d="M9.2 19C10.5 19.8 13.5 19.8 14.8 19"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppLogoBadge({
  size = 34,
  iconSize = 20,
}: {
  size?: number;
  iconSize?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: "linear-gradient(135deg, hsl(215 40% 22%) 0%, hsl(173 58% 42%) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 10px hsl(173 58% 42% / 0.35)",
        flexShrink: 0,
      }}
    >
      <AppLogo size={iconSize} color="#ffffff" />
    </div>
  );
}
