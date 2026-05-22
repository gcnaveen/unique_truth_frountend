import React from "react";
import { motion } from "framer-motion";

const Growthsection = () => {
  return (
    <section
      id="growth"
      className="relative overflow-hidden bg-[#0F2E15] py-20 sm:py-24 lg:py-28 xl:py-36"
    >
      <style>{`
        .growth-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px;
        }
        .growth-card {
          transition: border-color .35s, box-shadow .35s, transform .35s cubic-bezier(.22,1,.36,1);
        }
        // .growth-card:hover {
        //   border-color: rgba(201,168,108,.36);
        //   box-shadow: 0 30px 80px rgba(0,0,0,.45);
        //   transform: translateY(-3px);
        // }
      `}</style>

      {/* Ambient layers to match Aboutus tone */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-44 top-14 h-104 w-104 rounded-full bg-teal-400/5 blur-[115px]" />
        <div className="absolute -right-28 top-28 h-120 w-120 rounded-full bg-[#c9a86c]/6 blur-[130px]" />
        <div className="absolute bottom-8 left-1/3 h-72 w-72 rounded-full bg-emerald-500/5 blur-[95px]" />
        <div className="growth-noise absolute inset-0 opacity-[0.022]" />
        <div className="absolute inset-y-0 left-[6%] hidden lg:block w-px bg-linear-to-b from-transparent via-[#c9a86c]/10 to-transparent" />
        <div className="absolute inset-y-0 right-[6%] hidden lg:block w-px bg-linear-to-b from-transparent via-teal-400/8 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-14 xl:max-w-440">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-5 text-[0.62rem] font-semibold uppercase tracking-[0.5em] text-[#c9a86c]/84">
              Growth Journey
            </p>

            <h2
              className="text-[clamp(2.05rem,4.2vw,3.35rem)] font-light leading-[1.14] tracking-[-0.012em] text-[#fff8ef] 2xl:text-[clamp(2.5rem,3.9vw,4.1rem)]"
              style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
            >
              Let's Reveal Individualistic Psychology{" "}
              <em className="italic text-[#c9a86c]">through fingertips.</em>
            </h2>

            <div className="mt-7 h-px w-24 bg-linear-to-r from-[#c9a86c]/60 to-transparent" />

            <p className="mt-7 max-w-xl text-[0.93rem] leading-[1.88] text-[rgba(255,248,236,0.76)] xl:max-w-2xl xl:text-[1.02rem]">
              Your mind holds patterns only you can fully explore. We help you
              recognize those patterns and turn them into confident choices,
              clearer direction, and a deeper sense of who you are.
            </p>

            <p className="mt-4 max-w-xl text-[0.93rem] leading-[1.9] text-[rgba(255,248,236,0.64)] xl:max-w-2xl xl:text-[1.02rem]">
              Through fingerprint intelligence and a precision personal
              discovery report, you get more than insight - you get a grounded
              blueprint built for you alone. No guesswork, just truth you can
              build on.
            </p>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#c9a86c]/28 bg-white/3 px-4 py-2 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a86c]" />
              <span className="text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#c9a86c]/82">
                Tailored Personal Blueprint
              </span>
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-[min(430px,94%)] sm:max-w-[460px] lg:max-w-[430px] lg:justify-self-end"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.08,
            }}
          >
            <div className="growth-card relative overflow-hidden">
              <img
                src="/assets/growth_new.png"
                alt="Illustration of unlocking the mind and personal discovery"
                className="relative z-10 h-auto w-full rounded-3xl object-contain object-center"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Growthsection;
