export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#e50f1a" />
      <path d="M10 24V8h7.2c3 0 5 1.7 5 4.3 0 2-1.2 3.5-3.1 4.1L23 24h-3.6l-3.2-6.4H13.2V24H10Zm3.2-9h3.8c1.3 0 2-.7 2-1.7s-.7-1.7-2-1.7h-3.8V15Z" fill="#fff" />
    </svg>
  );
}

export default function Logo({ size = 28, tagline = false, stacked = false }) {
  return (
    <div className={"rz-logo" + (stacked ? " stacked" : "")}>
      <LogoMark size={size} />
      <div className="rz-logo-text">
        <span className="rz-logo-name">
          Ricoz<span>Recruit</span>
        </span>
        {tagline && <small>Talent Acquisition</small>}
      </div>
    </div>
  );
}
