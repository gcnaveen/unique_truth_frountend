import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionaryService } from "../api/questionaries";
import QuestionaryEnquiryFlow from "../components/QuestionaryEnquiryFlow";
import ServiceJourneyCtaButton, {
  SERVICE_ENQUIRY_ANCHOR_ID,
} from "../components/ServiceJourneyCtaButton";
import BrandText from "../components/BrandText";

const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold]);
  return [ref, visible];
};

const FadeUp = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useInView(0.08);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const Skillsbehindstudy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1f14] via-[#0f2e1a] to-[#0d2416]">
      {/* Noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl bg-cyan-500/5" />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full blur-3xl bg-amber-600/8" />
      </div>

      {/* Relative container for content */}
      <div className="relative z-10">
        {/* Header with back button */}
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
              Skills Behind Studies
            </div>
          </div>
        </header>

        {/* Hero section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <FadeUp>
            <h1 className="font-display text-5xl sm:text-6xl font-light text-[#fff8ef] mb-6 leading-tight">
              Skills Behind <span className="text-[#c9a86c]">Studies</span>
            </h1>
          </FadeUp>

          <FadeUp delay={100}>
            <p className="text-xl sm:text-2xl text-[rgba(255,248,236,0.8)] mb-12">
              Do you want your child to excel in academics?
            </p>
          </FadeUp>

          <div id={SERVICE_ENQUIRY_ANCHOR_ID} className="scroll-mt-28">
            <FadeUp delay={130}>
              <QuestionaryEnquiryFlow
                service={QuestionaryService.SKILLS_BEHIND_STUDIES}
                interstitialBeforeEnquiry={
                  "Are you curious to understand your child's Specific learning methods as per their Uniqueness and Are you expecting your child to study stress free and perform better in studies – Let's register and book an appointment connect Unique TRUTH experts."
                }
              />
            </FadeUp>
          </div>

          {/* Key Benefits */}
          <div className="mb-8">
            <FadeUp delay={150}>
              <h2 className="font-display text-3xl sm:text-4xl font-light text-[#fff8ef] mb-2 mt-10">
                🔹 Key Benefits / Value Proposition
              </h2>
            </FadeUp>
          </div>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-8 auto-rows-fr">
            {[
              "100% Stress Free Study Methods",
              "20 to 30+% Increase in Marks",
              "Builds Confidence in Every Learning",
              "1 Year Continued Support",
            ].map((benefit, idx) => (
              <FadeUp key={idx} delay={idx * 100 + 200}>
                <div className="group h-full p-6 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm hover:bg-white/8 transition-all duration-500 hover:border-[#c9a86c]/30 hover:shadow-lg hover:shadow-amber-600/10">
                  <div className="flex items-start gap-4">
                    <img
                      src="/assets/Fingerprint.png"
                      alt=""
                      className="h-7 w-7 mt-0.5 shrink-0 object-contain"
                      width={28}
                      height={28}
                      aria-hidden
                    />
                    <p className="text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.75)]">
                      {benefit}
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Hero Image Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-20">
          <FadeUp>
            <div className="relative group mx-auto max-w-5xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#5eead4]/20 to-[#c9a86c]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/assets/services/stud.png"
                alt="Skills Behind Studies Guide"
                className="relative w-full h-auto rounded-2xl border border-white/15 shadow-2xl"
              />
            </div>
          </FadeUp>
        </section>

        {/* Scientific Approach Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-20">
          {/* Intro paragraphs */}
          <FadeUp>
            <span className="inline-flex items-center rounded-full border border-[#c9a86c]/25 bg-[#14381f]/60 px-5 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-[#c9a86c] backdrop-blur-sm mb-8">
              World's First Proven Scientific Approach
            </span>
          </FadeUp>

          <div className="space-y-6 mb-16">
            <FadeUp delay={80}>
              <p className="text-[1rem] leading-[1.95] text-[rgba(255,248,236,0.72)] max-w-4xl">
                World's first proven scientific approach to find a child's
                specific learning method to learn anything stress free and
                develop{" "}
                <span className="text-[#c9a86c] font-medium">
                  Concentration, Comprehension,
                </span>{" "}
                and{" "}
                <span className="text-[#c9a86c] font-medium">
                  long-term memory.
                </span>
              </p>
            </FadeUp>
            <FadeUp delay={160}>
              <p className="text-[1rem] leading-[1.95] text-[rgba(255,248,236,0.62)] max-w-4xl">
                Our{" "}
                <span className="text-[#5eead4]">
                  13 years of research and study
                </span>{" "}
                says, the maximum percentage of 6 years and above children's
                unhealthy behaviors are directly connected to being unaware of
                skills behind studies and also practicing wrong methods which
                are influenced by others or taught by others.
              </p>
            </FadeUp>
            <FadeUp delay={240}>
              <p className="text-[1rem] leading-[1.95] text-[rgba(255,248,236,0.62)] max-w-4xl">
                With the support of{" "}
                <span className="text-[#c9a86c] font-medium">
                  <BrandText text="Unique TRUTH's" /> Fingerprint Analysis,
                </span>{" "}
                customized specific learning methods help a child to perform
                best in their academics.
              </p>
            </FadeUp>
          </div>

        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl p-12 sm:p-16 border border-[#c9a86c]/30 bg-gradient-to-r from-[#c9a86c]/10 via-[#5eead4]/5 to-[#c9a86c]/10 backdrop-blur-xl group cursor-pointer hover:border-[#c9a86c]/50 transition-all duration-500">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#c9a86c]/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 text-center">
                <h3 className="font-display text-3xl sm:text-4xl font-light text-[#fff8ef] mb-4">
                  Help Your Child Excel Academically
                </h3>
                <p className="text-[1rem] text-[rgba(255,248,236,0.7)] mb-8 max-w-2xl mx-auto">
                  Unlock your child's true learning potential with our
                  scientifically-proven approach tailored to their unique needs.
                </p>
                <ServiceJourneyCtaButton hasEnquiryFlow>
                  Start Your Child's Journey
                </ServiceJourneyCtaButton>
              </div>
            </div>
          </FadeUp>
        </section>

        {/* Footer spacer */}
        <div className="py-12" />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap');
        
        .font-display {
          font-family: 'Cormorant Garamond', serif;
        }
        
        .font-body {
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Skillsbehindstudy;
