import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
              onClick={() => navigate("/")}
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
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5eead4]">
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

          {/* Key Benefits */}
          <div className="mb-8">
            <FadeUp delay={150}>
              <h2 className="font-display text-3xl sm:text-4xl font-light text-[#fff8ef] mb-2">
                🔹 Key Benefits / Value Proposition
              </h2>
            </FadeUp>
          </div>

          {/* Benefits grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-8 auto-rows-fr">
            {[
              "100% Stress Free Study Methods",
              "20 to 30+% Increase in Marks",
              "Builds Self Confidence",
              "1 Year Continued Support",
            ].map((benefit, idx) => (
              <FadeUp key={idx} delay={idx * 100 + 200}>
                <div className="group h-full p-6 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm hover:bg-white/8 transition-all duration-500 hover:border-[#c9a86c]/30 hover:shadow-lg hover:shadow-amber-600/10">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 mt-1 shrink-0 rounded-full bg-gradient-to-br from-[#5eead4] to-[#c9a86c] flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-[#0f2e1a]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
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
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#5eead4]/20 to-[#c9a86c]/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src="/assets/services/studies.png"
                alt="Skills Behind Studies Guide"
                className="relative w-full h-auto rounded-2xl border border-white/15 shadow-2xl"
              />
            </div>
          </FadeUp>
        </section>

        {/* Scientific Approach Section */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <FadeUp>
            <h2 className="font-display text-4xl sm:text-5xl font-light text-[#fff8ef] mb-4">
              🔹 Scientific Approach / Method
            </h2>
            <div
              className="w-24 h-1 rounded-full mb-12"
              style={{
                background: "linear-gradient(90deg, #c9a86c 0%, #5eead4 100%)",
              }}
            />
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
            {[
              {
                title: "Fingerprint Analysis",
                description: "",
                icon: "🔹",
                accentColor: "from-[#c9a86c]",
              },
              {
                title: "Reveals concentration level",
                description: "",
                icon: "🔹",
                accentColor: "from-[#5eead4]",
              },
              {
                title: "Identifies grasping speed",
                description: "",
                icon: "🔹",
                accentColor: "from-[#c9a86c]",
              },
              {
                title: "Finds dominant learning method",
                description: "",
                icon: "🔹",
                accentColor: "from-[#5eead4]",
              },
            ].map((item, idx) => (
              <FadeUp key={idx} delay={idx * 120}>
                <div
                  className={`group h-full p-8 rounded-2xl border border-white/10 bg-gradient-to-br ${item.accentColor}/5 to-transparent backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 hover:shadow-xl cursor-pointer`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-display text-2xl font-light text-[#fff8ef] group-hover:text-[#c9a86c] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* Learning Challenges Sections */}
        <section className="max-w-6xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
          <div className="space-y-8">
            {/* Type 1 */}
            <FadeUp>
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 group">
                <h3 className="font-display text-2xl font-light text-[#fff8ef] group-hover:text-[#c9a86c] transition-colors mb-6">
                  🔹 Do You Know? (Learning Challenges – Type 1)
                </h3>
                <div className="space-y-3">
                  {[
                    "Fall asleep if they study in the room",
                    "Forget the words if they are marked by highlighters",
                    "Find it difficult to understand if they study silently",
                  ].map((challenge, idx) => (
                    <p
                      key={idx}
                      className="text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.8)] group-hover:text-[rgba(255,248,236,0.95)] transition-colors flex items-start gap-3"
                    >
                      <span className="text-[#5eead4] mt-1">•</span>
                      {challenge}
                    </p>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Type 2 */}
            <FadeUp delay={150}>
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 group">
                <h3 className="font-display text-2xl font-light text-[#fff8ef] group-hover:text-[#c9a86c] transition-colors mb-6">
                  🔹 Do You Know? (Learning Challenges – Type 2)
                </h3>
                <div className="space-y-3">
                  {[
                    "Get distracted if they study for more than 20 minutes",
                    "Body & mind do not support studying quietly",
                    "Difficult to understand just by reading and listening",
                  ].map((challenge, idx) => (
                    <p
                      key={idx}
                      className="text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.8)] group-hover:text-[rgba(255,248,236,0.95)] transition-colors flex items-start gap-3"
                    >
                      <span className="text-[#5eead4] mt-1">•</span>
                      {challenge}
                    </p>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Type 3 */}
            <FadeUp delay={300}>
              <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-white/20 transition-all duration-500 group">
                <h3 className="font-display text-2xl font-light text-[#fff8ef] group-hover:text-[#c9a86c] transition-colors mb-6">
                  🔹 Do You Know? (Learning Challenges – Type 3)
                </h3>
                <div className="space-y-3">
                  {[
                    "Difficult to concentrate in noisy environments",
                    "Get distracted in group discussions",
                    "Trouble concentrating when tasks are assigned in between",
                  ].map((challenge, idx) => (
                    <p
                      key={idx}
                      className="text-[0.95rem] leading-relaxed text-[rgba(255,248,236,0.8)] group-hover:text-[rgba(255,248,236,0.95)] transition-colors flex items-start gap-3"
                    >
                      <span className="text-[#5eead4] mt-1">•</span>
                      {challenge}
                    </p>
                  ))}
                </div>
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
                  Help Your Child Excel Academically
                </h3>
                <p className="text-[1rem] text-[rgba(255,248,236,0.7)] mb-8 max-w-2xl mx-auto">
                  Unlock your child's true learning potential with our
                  scientifically-proven approach tailored to their unique needs.
                </p>
                <button className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-[#c9a86c] to-[#5eead4] text-[#0f2e1a] font-semibold text-sm uppercase tracking-[0.15em] hover:shadow-xl hover:shadow-amber-600/40 transition-all duration-300 hover:scale-105 cursor-pointer">
                  Start Your Child's Journey
                </button>
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
