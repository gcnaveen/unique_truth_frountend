import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ServiceJourneyCtaButton from "../components/ServiceJourneyCtaButton";

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

const Talentawareness = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0a1f14] via-[#0f2e1a] to-[#0d2416]">
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
          <div className="max-w-6xl mx-auto px-6 sm:px-8 py-4 flex items-center justify-between xl:max-w-440">
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
              Talent Awareness
            </div>
          </div>
        </header>

        {/* Hero section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 xl:max-w-440 xl:py-28">
          <FadeUp>
            <h1 className="font-display text-5xl sm:text-6xl font-light text-[#fff8ef] mb-6 leading-tight 2xl:text-7xl">
              Benefits of{" "}
              <span className="text-[#c9a86c]">Talent Awareness</span>
            </h1>
          </FadeUp>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-12 auto-rows-fr">
            {[
              "Get complete authentic clarity about choosing the best Career.",
              "Understand the Myths behind Strengths and Weakness.",
              "Overcome Stress, Self Doubts, Dual thoughts, Confusions, Struggling, Suffering, and gain Confidence for your whole life.",
              "Explore your fullest potential with your inborn Skills, Intelligence and Core Qualities.",
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
        <section className="max-w-6xl mx-auto px-6 sm:px-8 pt-12 pb-8 sm:pt-16 sm:pb-10 xl:max-w-440 xl:pt-20 xl:pb-12">
          <FadeUp>
            <div className="relative group mx-auto max-w-5xl">
              <div className="absolute -inset-1 bg-linear-to-r from-[#5eead4]/20 to-[#c9a86c]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/assets/services/talent.png"
                alt="Talent Awareness Journey Map"
                className="relative w-full h-auto rounded-2xl border border-white/15 shadow-2xl"
              />
            </div>
          </FadeUp>
        </section>

        {/* Latent Success Path */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 pt-10 pb-16 sm:pt-12 sm:pb-24 xl:max-w-440 xl:pt-14 xl:pb-28">
          {/* <FadeUp>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-[#fff8ef] mb-4">
              Latent Success Path
            </h2>
            <div
              className="w-24 h-1 rounded-full mb-12"
              style={{
                background: "linear-gradient(90deg, #c9a86c 0%, #5eead4 100%)",
              }}
            />
          </FadeUp> */}

          <div className="space-y-8">
            {/* Five pillars */}
            <div className="grid md:grid-cols-2 gap-6 mt-10 auto-rows-fr">
              {[
                {
                  title: "Latent Success Path",
                  description:
                    "Top 3 skills out of 12 professional skills increase your performance, productivity and satisfaction without struggling and Stress.",
                  image:
                    "/assets/services/talentawareness/Latentsuccesspath.png",
                  accentColor: "from-[#5eead4]",
                },
                {
                  title: "4 Leadership Styles",
                  description:
                    "Every Leader is born for a reason with complete powers to empower the world and fulfil their deeper desires, purpose through their unique approaches and create leaders for the world's betterment.",
                  image: "/assets/services/talentawareness/4leadership.png",
                  accentColor: "from-[#c9a86c]",
                },
                {
                  title: "5 Thinking and Perception",
                  description:
                    "The whole Psychology itself is all about 5 Thinkers in the world, We are pioneers in teaching about 5 thinkers' psychology, is the ultimate winning to convert every lead into business and grow effortlessly.",
                  image: "/assets/services/talentawareness/5thinking.png",
                  accentColor: "from-[#5eead4]",
                },
                {
                  title: "Multiple Intelligence",
                  description:
                    "Inborn Dominant intelligence is the driving force for life to gain self-motivation without external support, to create a big contribution for the world.",
                  image:
                    "/assets/services/talentawareness/Multipleintelligence.png",
                  accentColor: "from-[#c9a86c]",
                },
                {
                  title: "Career Guidance",
                  description:
                    "Is the Road Map for an individual who has lots of confusion about what to study and choose as a career, with a star ratings from 1 to 5.",
                  image: "/assets/services/talentawareness/Careerguidance.png",
                  accentColor: "from-[#5eead4]",
                },
              ].map((pillar, idx) => (
                <FadeUp key={idx} delay={idx * 120}>
                  <div
                    className={`group h-full p-8 rounded-2xl border border-white/10 bg-linear-to-br ${pillar.accentColor}/5 to-transparent backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 hover:shadow-xl cursor-pointer`}
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
                        <p className="mt-3 text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.7)] xl:text-[1rem]">
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

        {/* Why section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 xl:max-w-440 xl:py-28">
          <FadeUp>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-[#fff8ef] mb-4 flex items-center gap-3">
              <span>❓ Why do you want to experience Talent Awareness?</span>
            </h2>
            <div
              className="w-24 h-1 rounded-full mb-12"
              style={{
                background: "linear-gradient(90deg, #5eead4 0%, #c9a86c 100%)",
              }}
            />
          </FadeUp>

          <div className="space-y-6 max-w-4xl">
            {[
              "Stress is inevitable! No it's a big myth in the world. When you make something what you like, love with passion and involvement, as per your inborn Dominant Skills, Intelligence, and Core qualities, you never feel Stress.",
              "Most of the individuals' talent, priorities, and choices are not used yet. They are influenced by parents, celebrities, and what tempts them at that time.",
            ].map((text, idx) => (
              <FadeUp key={idx} delay={idx * 150}>
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 group">
                  <p className="text-[1rem] leading-relaxed text-[rgba(255,248,236,0.8)] group-hover:text-[rgba(255,248,236,0.95)] transition-colors">
                    {text}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 xl:max-w-440 xl:py-28">
          <FadeUp>
            <div className="relative overflow-hidden rounded-3xl p-12 sm:p-16 border border-[#c9a86c]/30 bg-linear-to-r from-[#c9a86c]/10 via-[#5eead4]/5 to-[#c9a86c]/10 backdrop-blur-xl group cursor-pointer hover:border-[#c9a86c]/50 transition-all duration-500">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#c9a86c]/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 text-center">
                <h3 className="font-display text-3xl sm:text-4xl font-light text-[#fff8ef] mb-4">
                  Ready to discover your true potential?
                </h3>
                <p className="text-[1rem] text-[rgba(255,248,236,0.7)] mb-8 max-w-2xl mx-auto">
                  Begin your Talent Awareness journey today and unlock the
                  natural gifts that will guide your path to success.
                </p>
                <ServiceJourneyCtaButton hasEnquiryFlow={false}>
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

export default Talentawareness;
