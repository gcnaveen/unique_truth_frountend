import React from "react";
import { useNavigate } from "react-router-dom";

/** Anchor id for pages that mount `QuestionaryEnquiryFlow` above the fold. */
export const SERVICE_ENQUIRY_ANCHOR_ID = "service-enquiry-anchor";

export default function ServiceJourneyCtaButton({ children, hasEnquiryFlow }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (hasEnquiryFlow) {
      const el = document.getElementById(SERVICE_ENQUIRY_ANCHOR_ID);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    navigate({
      pathname: "/",
      hash: "contact",
      state: { scrollTo: "contact" },
    });
  };

  return (
    <>
      <span className="sj-cta relative inline-flex rounded-full p-[2px] overflow-hidden align-middle">
        <span
          className="sj-cta__glow pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[240%] max-w-none rounded-full bg-[conic-gradient(from_0deg,#5eead4,#c9a86c,#2dd4bf,#c9a86c,#5eead4)] opacity-90"
          aria-hidden
        />
        <button
          type="button"
          onClick={handleClick}
          className="relative z-10 inline-block overflow-hidden rounded-full border border-white/10 bg-gradient-to-r from-[#c9a86c] to-[#5eead4] px-8 py-4 text-center text-sm font-semibold uppercase tracking-[0.15em] text-[#0f2e1a] shadow-inner shadow-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-600/40 cursor-pointer"
        >
          <span
            className="sj-cta__shimmer pointer-events-none absolute inset-0 z-1 overflow-hidden rounded-full"
            aria-hidden
          >
            <span className="sj-cta__shimmer-beam" />
          </span>
          <span className="relative z-2">{children}</span>
        </button>
      </span>
      <style>{`
        .sj-cta__glow {
          animation: sj-cta-spin 3.8s linear infinite;
        }
        @keyframes sj-cta-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        .sj-cta__shimmer-beam {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 48%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.08) 28%,
            rgba(255, 255, 255, 0.92) 50%,
            rgba(255, 255, 255, 0.08) 72%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: translateX(-120%);
          animation: sj-cta-shimmer-sweep 2.4s linear infinite;
          will-change: transform;
        }

        @keyframes sj-cta-shimmer-sweep {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(320%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sj-cta__shimmer-beam {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
