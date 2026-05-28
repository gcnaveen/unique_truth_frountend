import { Link } from "react-router-dom";

const logoSrc = "/assets/nobglogo.png";

export default function PortalBrand({ compact = false }) {
  return (
    <Link
      to="/portal/dashboard"
      className="group flex items-center gap-3 no-underline"
      aria-label="Unique Truth member portal home"
    >
      <div className="relative flex shrink-0 items-center justify-center">
        <div className="absolute inset-0 rounded-xl bg-[#5eead4]/20 blur-md transition group-hover:bg-[#5eead4]/30" />
        <img
          src={logoSrc}
          alt="Unique Truth"
          className={
            compact
              ? "relative h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
              : "relative h-11 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)] sm:h-12"
          }
        />
      </div>
      <div className="min-w-0">
        <p className="font-serif text-sm font-semibold leading-tight text-white sm:text-base">
          Unique Truth
        </p>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#5eead4]/90 sm:text-xs">
          Member portal
        </p>
      </div>
    </Link>
  );
}
