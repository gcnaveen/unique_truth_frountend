import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QuestionaryService } from "../api/questionaries";
import QuestionaryEnquiryFlow from "../components/QuestionaryEnquiryFlow";
import ServiceJourneyCtaButton, {
  SERVICE_ENQUIRY_ANCHOR_ID,
} from "../components/ServiceJourneyCtaButton";

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

const Behavioralawareness = () => {
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
              Behavioral Awareness
            </div>
          </div>
        </header>

        {/* Hero section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <FadeUp>
            <h1 className="font-display text-5xl sm:text-6xl font-light text-[#fff8ef] mb-6 leading-tight">
              Benefits of{" "}
              <span className="text-[#c9a86c]">Behavioral Awareness</span>
            </h1>
          </FadeUp>

          <div id={SERVICE_ENQUIRY_ANCHOR_ID} className="scroll-mt-28 mb-10">
            <FadeUp delay={120}>
              <QuestionaryEnquiryFlow
                service={QuestionaryService.BEHAVIORAL_AWARENESS}
                interstitialBeforeEnquiry={
                  "Would you love to experience your child's best behaviour by providing right environment as per their inborn natures. You are aware that building confidence in every aspect leads to best behaviour. Let's book an appointment with our Unique TRUTH experts."
                }
              />
            </FadeUp>
          </div>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-12 auto-rows-fr">
            {[
              "They listen to your specific method of approach",
              "Anger, sensitivity, irritation, stubbornness and disrespect nature gets 100% best solutions.",
              "Become free from addictions to gadgets and develops best favorite hobbies",
              "Overcome confusions, shyness, judgements, laziness, overthinking, fear, anxiety & depression permanently.",
            ].map((benefit, idx) => (
              <FadeUp key={idx} delay={idx * 100}>
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
                src="/assets/services/BehavioralAwareness.png"
                alt="Behavioral Awareness Guide"
                className="relative w-full h-auto rounded-2xl border border-white/15 shadow-2xl"
              />
            </div>
          </FadeUp>
        </section>

        {/* Key Insights Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="space-y-8">
            {/* Four pillars */}
            <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
              {[
                {
                  title: "Inborn personality & Behaviour",
                  description:
                    "Personality reveals person's thoughts, feelings, behaviour and it helps to know how to build right Self Image and high Self Esteem.",
                  image:
                    "/assets/services/behavioralawareness/Inbornpersonality &Behaviour.png",
                  accentColor: "from-[#c9a86c]",
                },
                {
                  title: "5 ways to Increase IQ",
                  description:
                    "Brain expects a very specific way of informations to understand, analyse, process, plan and execute. This approach increases the performance.",
                  image: "/assets/services/behavioralawareness/5ways.png",
                  accentColor: "from-[#5eead4]",
                },
                {
                  title: "Brain Dominance",
                  description:
                    "Gives complete insight and clarity about both the logical and emotional brain's nature.",
                  image:
                    "/assets/services/behavioralawareness/Braindominance.png",
                  accentColor: "from-[#c9a86c]",
                },
                {
                  title: "Favorite Hobbies",
                  description:
                    "Tells you about inborn interested fields which makes stress-free life, generate creative & innovative ideas for one's growth.",
                  image:
                    "/assets/services/behavioralawareness/Favoritehobbies.png",
                  accentColor: "from-[#5eead4]",
                },
              ].map((pillar, idx) => (
                <FadeUp key={idx} delay={idx * 120}>
                  <div
                    className={`group h-full p-8 rounded-2xl border border-white/10 bg-gradient-to-br ${pillar.accentColor}/5 to-transparent backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 hover:shadow-xl cursor-pointer`}
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="flex w-full shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-40 sm:w-40">
                        <img
                          src={pillar.image}
                          alt={pillar.title}
                          className="h-full w-full object-contain object-center"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-2xl font-light text-[#fff8ef] group-hover:text-[#c9a86c] transition-colors">
                          {pillar.title}
                        </h3>
                        <p className="mt-3 text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.7)]">
                          {pillar.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

        </section>

        {/* Developments section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="space-y-6">
            <FadeUp>
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 group">
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-2xl">🔸</span>
                  <h3 className="font-display text-2xl font-light text-[#fff8ef] group-hover:text-[#c9a86c] transition-colors">
                    Developments That You Can See In Your Loved Ones
                  </h3>
                </div>
                <p className="text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.8)] group-hover:text-[rgba(255,248,236,0.95)] transition-colors">
                  Patience, Positivity, Creativity, Self Confidence - Image -
                  Esteem, Respecting Elders, Best Performance by Taking
                  Responsibility, Involving in Favorite Hobbies & USING BOTH THE
                  LEFT AND RIGHT BRAIN FOR HOLISTIC GROWTH.
                </p>
              </div>
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
                  Unlock Your Behavioral Potential
                </h3>
                <p className="text-[1rem] text-[rgba(255,248,236,0.7)] mb-8 max-w-2xl mx-auto">
                  Discover how understanding your behavioral patterns can
                  transform your relationships and personal growth journey.
                </p>
                <ServiceJourneyCtaButton hasEnquiryFlow>
                  Start Your Journey
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

export default Behavioralawareness;
