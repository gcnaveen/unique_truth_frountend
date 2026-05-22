import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BrandText from "../components/BrandText";
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

const Relationshipawareness = () => {
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
              Relationship Awareness
            </div>
          </div>
        </header>

        {/* Hero section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 xl:max-w-440 xl:py-28">
          <FadeUp>
            <h1 className="font-display text-5xl sm:text-6xl font-light text-[#fff8ef] mb-6 leading-tight 2xl:text-7xl">
              Benefits of{" "}
              <span className="text-[#c9a86c]">Relationship Awareness</span>
            </h1>
          </FadeUp>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-12 auto-rows-fr">
            {[
              "Understanding the Myths and Truths behind Misunderstood Relationship.",
              "Mastery in Acceptance to get rid of Adjustments, Compromises and Sacrificing life.",
              "Become Mentally, Emotionally and Physically Strong.",
              "True love wins Mood swings, Assumptions, Upsets, Arguments, Possessiveness, Overthinking, Anxiety, Attachment and Conflicts.",
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
                      <BrandText text={benefit} />
                    </p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Hero Image Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-20 xl:max-w-440 xl:py-24">
          <FadeUp>
            <div className="relative group mx-auto max-w-5xl">
              <div className="absolute -inset-1 bg-linear-to-r from-[#5eead4]/20 to-[#c9a86c]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/assets/services/relationship_new.png"
                alt="Relationship Awareness Guide"
                className="relative w-full h-auto rounded-2xl border border-white/15 shadow-2xl"
              />
            </div>
          </FadeUp>
        </section>

        {/* Key Pillars Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 xl:max-w-440 xl:py-28">
          <div className="space-y-8">
            {/* First two sections */}
            <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
              {[
                {
                  title: "Core Qualities",
                  description:
                    "The world has deeper myths behind why people don't RESPECT us. Usually, people think we made repeated mistakes or didn't listen to them; in turn, people don't respect us, NO!, the TRUTH is, using the top 3 Dominant Core Qualities out of 10 core qualities, then people naturally Respect us all the time. Because it creates the best difference in people's life.",
                  image:
                    "/assets/services/relationshipawareness/corequalities.png",
                  accentColor: "from-[#c9a86c]",
                },
                {
                  title: "IQ, EQ, AQ & CQ Quotients",
                  description:
                    "Where 2 individuals have different dominant quotients, there is a lack of coordination and support system at home or the workplace; they can't accept each other, and it leads to bigger conflicts in relationships. Being aware of Dominant Quotient complementing to explore their true potential.",
                  image: "/assets/services/relationshipawareness/iqeq.png",
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
                          <BrandText text={pillar.description} />
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>

            {/* Next two sections */}
            <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
              {[
                {
                  title: "5 ways to Enhance EQ",
                  description:
                    "The world's first scientific approach to understand the deeper feelings of acceptance and rejection of love by understanding 5 Love Languages, Lack of love as per a person's Love Language is the root cause for Mood swings, Possessiveness, Anxiety, Autism, and over thinking. Awareness of love languages builds Safe, secure and confidence in a person.",
                  image: "/assets/services/relationshipawareness/5waysto.png",
                  accentColor: "from-[#c9a86c]",
                },
                {
                  title: "SWOT Analysis",
                  description:
                    "Every individual is born only with Strengths (S), never born with weaknesses, weakness never existed. We need to be ready for Willing to work on (W) the areas to be developed, focus on Opportunities (O), and have to Take charge (T) of our inborn Personality to explore.",
                  image: "/assets/services/relationshipawareness/swot.png",
                  accentColor: "from-[#5eead4]",
                },
              ].map((pillar, idx) => (
                <FadeUp key={idx} delay={(idx + 2) * 120}>
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
                        <p className="mt-3 text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.7)]">
                          <BrandText text={pillar.description} />
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* Final outcomes section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24 xl:max-w-440 xl:py-28">
          <div className="space-y-6">
            {[
              {
                title: "Permanent gains in your RELATIONSHIPS",
                description:
                  "Understanding your and your family's psychology, Always feeling Happy in Self, Family and Social Relationships; Authentic Respect in Relationships; Supportive and Co-operative bonding; Experiencing constant love in you, Feels peace, Safe, Secure and Confident in a Harmonious Relationship.",
                image:
                  "/assets/services/relationshipawareness/permanentgains.png",
                accentColor: "#c9a86c",
              },
              {
                title: "Source of Happiness",
                description:
                  "People are suffering in life by forgetting the importance of Happiness as a goal. Happiness is a generic subject in the world, No! It is an individualistic Focus in Unique TRUTH.\n\nPeople experience happiness within Self, Family and Society.\n\nUnderstanding each family member's specific source of happiness and blind spots brings your worries to 0%.",
                image:
                  "/assets/services/relationshipawareness/sourceofhappiness.png",
                accentColor: "#5eead4",
              },
            ].map((item, idx) => (
              <FadeUp key={idx} delay={idx * 150}>
                <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 group">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex w-full shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-44 sm:w-44">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-contain object-center"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-2xl font-light text-[#fff8ef] group-hover:text-[#c9a86c] transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.8)] group-hover:text-[rgba(255,248,236,0.95)] transition-colors whitespace-pre-line">
                        <BrandText text={item.description} />
                      </p>
                    </div>
                  </div>
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
                  Transform Your Relationships Today
                </h3>
                <p className="text-[1rem] text-[rgba(255,248,236,0.7)] mb-8 max-w-2xl mx-auto">
                  Discover the authentic connection and deep understanding that
                  leads to harmonious, fulfilling relationships built on truth.
                </p>
                <ServiceJourneyCtaButton hasEnquiryFlow={false}>
                  Begin Your Journey
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

export default Relationshipawareness;
