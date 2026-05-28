import React from "react";
import { useNavigate } from "react-router-dom";
import { QuestionaryService } from "../api/questionaries";
import QuestionaryEnquiryFlow from "../components/QuestionaryEnquiryFlow";
import ServiceJourneyCtaButton, {
  SERVICE_ENQUIRY_ANCHOR_ID,
} from "../components/ServiceJourneyCtaButton";

export default function Completepackage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1f14] via-[#0f2e1a] to-[#0d2416]">
      <div className="relative z-10">
        <header className="sticky top-0 z-40 backdrop-blur-lg bg-[#0f2e1a]/40 border-b border-white/5">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/#services")}
              className="flex items-center gap-2 text-sm font-medium text-[#c9a86c] hover:text-[#e8d5b5] transition-colors duration-300 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <div className="font-service-truth-header text-[0.65rem] uppercase tracking-[0.16em] text-[#fff8ef] sm:text-xs">
              Complete Package
            </div>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <h1 className="font-display text-5xl sm:text-6xl font-light text-[#fff8ef] mb-6 leading-tight">
            Complete <span className="text-[#c9a86c]">Package</span>
          </h1>
          <p className="text-xl sm:text-2xl text-[rgba(255,248,236,0.8)] mb-10">
            One combined enquiry for all services under a single package.
          </p>

          <div id={SERVICE_ENQUIRY_ANCHOR_ID} className="scroll-mt-28">
            <QuestionaryEnquiryFlow
              service={QuestionaryService.COMPLETE_PACKAGE}
              interstitialBeforeEnquiry={
                "Would you like to continue with the complete package covering all services in one combined plan?"
              }
            />
          </div>

          <div className="mt-12 rounded-2xl border border-[#c9a86c]/25 bg-white/5 p-6">
            <p className="text-sm text-[rgba(255,248,236,0.82)]">
              This package is designed for members who want to unlock all service tracks in one
              journey. Your combined enquiry is mapped to one package payment flow.
            </p>
          </div>

          <div className="mt-10">
            <ServiceJourneyCtaButton hasEnquiryFlow>
              Start Complete Package
            </ServiceJourneyCtaButton>
          </div>
        </section>
      </div>
    </div>
  );
}
