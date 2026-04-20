import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REVIEWS = [
  {
    id: 0,
    name: "Basavaraju S",
    role: "Technical Lead, Sightspectrum Technology Solutions Private Limited, Bangalore",
    stars: 5,
    text: "Found about this through Rapid Rashmi YouTube Podcast. I work in tech. Professional with 8+ years of experience. I recently got my fingerprint analysis and DMIT report done through Dr. Muruli, and honestly, it was way more insightful than I expected. The report itself was detailed, but what made the real difference was how he explained it. He did not just read out the data, he actually connected it to real-life situations I could relate to. He spoke about how certain traits of mine would play out in work, learning, or even handling stress, and gave practical suggestions on what to do in those moments. It felt like talking to someone who genuinely understands how people think and behave. Not once did it feel like a scripted consultation. I walked away with more clarity on how I naturally operate, what I should lean into more, and what areas I can consciously work on. If you are someone who is curious about your own potential or just looking for direction, I definitely recommend giving this a try.",
  },
  {
    id: 1,
    name: "Mahesh Hulivana Manchegowda",
    role: "One Health LLC, Project Manager, UAE",
    stars: 5,
    text: "As a UAE resident, my weekends are usually a mix of relaxation and catching up on content that adds value to my life. Recently, while watching a podcast by Rapid Rashmi featuring Dr. Muruli, I came across a fascinating concept: fingerprint analysis, but not in the way most of us know it. We often associate fingerprint analysis with forensic investigations, biometric security, background checks, or even identification of the deceased. But what truly caught my attention was the lesser-known side of this science: understanding your inborn personality traits through your fingerprints. You could call it a SWOT analysis of a person, discovered at birth. Despite being over 50, I decided to undergo my own fingerprint personality analysis, and the results were eye-opening. Unlike astrology, numerology, or other predictive sciences, this method is rooted in neuroscience and behavioral studies. It does not tell you your future, it tells you the truth of who you are, your natural strengths, challenges, learning styles, and potential. And it does so with stunning accuracy. After watching the entire 140-minute episode in one sitting, I walked away not only with a better understanding of myself, but with a deep sense of clarity on how I can better align my efforts with my inborn qualities. It was genuinely life-enriching. I now strongly believe that fingerprint analysis is something every family should consider doing, to understand each other better, to communicate more effectively, and to truly support each other's growth.",
  },
  {
    id: 2,
    name: "Ranganatha Naykar",
    role: "Managing Director, Nutriplanet Foods Private Limited",
    stars: 5,
    text: "Thank you Unique Truth. I never knew something like this existed. Very happy to be associated with you and your team. Thank you for letting us know our uniqueness and giving specific and to-the-dot examples and also helping us to explore as individuals and family as well. I look forward to the continuous learning and exploring sessions.",
  },
  {
    id: 3,
    name: "Reena Gagan",
    role: "Founder, Aditi Little Feats Kindergarden, Coorg",
    stars: 5,
    text: "Before I met Muruli sir and Amaresh sir, I had already watched their videos and adapted them in my preschool. Each and every talk of theirs was truly trustworthy and factual. They explained very well how my and my daughter's brain works, which has greatly helped us with good parenting and developing their abilities. It strengthened my confidence and I have become much stronger than before. It was a very good experience and I request and recommend others to utilize this for a better future. Thank you Muruli sir and Amaresh sir. As a preschool owner and teacher, I am very satisfied with Unique Truth.",
  },
  {
    id: 4,
    name: "Lakshmi Prabha JS",
    role: "Digital Marketer, Tamil Nadu",
    stars: 5,
    text: "When I first heard about fingerprint analysis, I was skeptical about how much could truly be uncovered from something so simple. However, after experiencing it myself, I was genuinely amazed. The analysis was not only highly relatable but also incredibly insightful, revealing aspects of my personality, strengths, and potential. It felt like they had a window into my unique blueprint, and the accuracy was almost insane. This is not just a service, it is an eye-opening journey of self-discovery. Dr. Muruli sir's depth of knowledge and intuitive approach made the entire experience not only insightful but also transformative. He has an exceptional ability to explain complex insights in a way that feels personal and relatable. I am deeply grateful getting this analysis done!",
  },
  {
    id: 5,
    name: "Veda Kumar H P",
    role: "Team Leader at Indo MIM Pvt Ltd, Bangalore",
    stars: 5,
    text: "Earlier I was very curious and had doubt about your analysis, but when I came back from your office yesterday, you erased all my doubts and confusion. Now I am very clear about me, and the path is visible for me now. The only thing is implementation. Do continue your amazing work towards creating a joyful life for every individual of this world. Your research is mind-blowing. So many people are suffering from many problems in the current situation, but no one is trying to find a cause for that. Unique Truth is the place for finding all the causes and most importantly every individual is a unique creation in this world. Most people do not know this important point. Who wants to live a joyful life, please know yourself first with Unique Truth. Once again thanks a lot to show me what I am.",
  },
  {
    id: 6,
    name: "Ashok Kumar K B",
    role: "Founder & CEO, Ashok Realty Group",
    stars: 5,
    text: "Heartfelt thanks for your guidance, Dr. Muruli. I am writing to express my deepest gratitude for your invaluable guidance and insights into brain analysis. The knowledge and suggestions you have shared with me have not only inspired me but have also provided me with actionable steps to adopt in my daily life. Your mentorship has been truly transformative. It has allowed me to better understand myself, refine my thinking processes, and approach challenges with greater clarity and resilience. I am incredibly grateful for the time, effort, and wisdom you have invested in helping me grow. Thank you once again for being such a pivotal influence in my journey. I look forward to continuing to learn from you and applying your teachings in meaningful ways. With warm regards and heartfelt appreciation, Ashok Kumar K B.",
  },
  {
    id: 7,
    name: "Shravan Tallam",
    role: "SAP Consultant at Deloitte, Bangalore",
    stars: 5,
    text: "I wish I had known about Unique Truth and Dr. Muruli sir earlier, which would have helped me gain so much clarity about my personal and professional life. Like sir rightly mentioned, this session has definitely made me understand my brain's software and how to utilize it to its full potential. From a career point of view it is very important for us to know our strengths and core qualities so that we can easily reach greater heights in our professional life. Thank you Dr. Muruli sir and Unique Truth!",
  },
  {
    id: 8,
    name: "Manish Khedia",
    role: "Parent",
    stars: 5,
    text: "Had an opportunity to connect with Dr. Muruli to go through fingerprint analysis for our daughter and we must admit he helped identify the blind spots, reaffirmed some of our observations as a parent, and guided us for our go-forward journey as a parent using our daughter's strengths and working on some areas to help her improve. Truly an amazing experience. Dr. Muruli is very approachable. Wishing you all the best as you continue your journey to help each individual understand their traits and help them succeed and be happy!",
  },
];

/* Ornate SVG ring around each avatar */
function OrnateRing() {
  return (
    <svg
      viewBox="0 0 110 110"
      className="absolute inset-0 h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="55" cy="55" r="51" stroke="#b38a4a" strokeWidth="1.2" strokeDasharray="5 3.5" opacity="0.55" />
      <circle cx="55" cy="55" r="45" stroke="#c9a86c" strokeWidth="2.2" opacity="0.9" />
      <circle cx="55" cy="55" r="38" stroke="#b38a4a" strokeWidth="0.8" strokeDasharray="2 5" opacity="0.38" />
      {[[55, 1.5], [108.5, 55], [55, 108.5], [1.5, 55]].map(([x, y], i) => (
        <rect
          key={i}
          x={x - 3.6}
          y={y - 3.6}
          width="7.2"
          height="7.2"
          fill="#c9a86c"
          opacity="0.78"
          transform={`rotate(45,${x},${y})`}
        />
      ))}
    </svg>
  );
}

export default function Clientreviews() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback(
    (idx) => {
      setDir(idx >= current ? 1 : -1);
      setCurrent(idx);
    },
    [current]
  );

  const prev = useCallback(() => {
    setDir(-1);
    setCurrent((c) => (c - 1 + REVIEWS.length) % REVIEWS.length);
  }, []);

  const next = useCallback(() => {
    setDir(1);
    setCurrent((c) => (c + 1) % REVIEWS.length);
  }, []);

  useEffect(() => {
    const t = setInterval(next, 10000);
    return () => clearInterval(t);
  }, [next]);

  const r = REVIEWS[current];
  const initials = r.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  const textVariants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 30 : -30 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -30 : 30 }),
  };

  return (
    <section className="relative overflow-hidden bg-[#0F2E15] py-20 sm:py-28 xl:py-36">
      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-44 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full bg-[#c9a86c]/10 blur-[105px]" />
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-600/6 blur-[90px]" />
        <div className="absolute inset-y-0 left-[6%] hidden w-px bg-linear-to-b from-transparent via-[#c9a86c]/8 to-transparent lg:block" />
        <div className="absolute inset-y-0 right-[6%] hidden w-px bg-linear-to-b from-transparent via-teal-400/6 to-transparent lg:block" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 xl:max-w-6xl">
        {/* Section heading */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-4 text-[0.6rem] font-semibold uppercase tracking-[0.55em] text-[#c9a86c]/82">
            Client Testimonials
          </p>
          <h2
            className="text-[clamp(2.1rem,4.8vw,3.45rem)] font-light leading-[1.1] text-[#fff8ef] 2xl:text-[clamp(2.6rem,4.2vw,4rem)]"
            style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
          >
            What Our <em className="italic text-[#c9a86c]">Clients</em> Say
          </h2>
          <p className="mt-3 text-[0.84rem] tracking-wide text-[#fff2df]/55 xl:text-[0.95rem]">
            Testimonial is our testimonials
          </p>
          <div className="mx-auto mt-5 h-px w-20 bg-linear-to-r from-transparent via-[#c9a86c]/45 to-transparent" />
        </motion.div>

        {/* Card + nav arrows row */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Prev arrow */}
          <button
            onClick={prev}
            aria-label="Previous review"
            className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c9a86c]/32 bg-white/4 text-[1.6rem] leading-none text-[#c9a86c] backdrop-blur-sm transition-all duration-200 hover:border-[#c9a86c]/55 hover:bg-[#c9a86c]/14"
          >
            ‹
          </button>

          {/* ── Cloud / Parchment Card ── */}
          <motion.div
            className="relative flex-1"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.82, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Outer drop-shadow wrapper (clip-free so shadow shows) */}
            <div
              style={{
                filter:
                  "drop-shadow(0 24px 56px rgba(0,0,0,0.44)) drop-shadow(0 6px 16px rgba(0,0,0,0.22))",
              }}
            >
              {/* Parchment card with organic border-radius */}
              <div
                className="relative overflow-hidden"
                style={{
                  background:
                    "radial-gradient(ellipse at 20% 25%, #fef9ec 0%, #f6e5c2 55%, #edcf9e 100%)",
                  borderRadius: "54px 42px 60px 44px / 44px 58px 44px 54px",
                }}
              >
                {/* Top sheen */}
                <div className="absolute left-1/2 top-0 h-px w-3/5 -translate-x-1/2 bg-linear-to-r from-transparent via-white/75 to-transparent" />

                {/* Aged paper noise */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.042]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    backgroundSize: "200px",
                  }}
                />

                {/* Ornate SVG border overlay */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <rect
                    x="1.5" y="1.5" width="97" height="97"
                    rx="14" ry="11"
                    fill="none" stroke="#c9a86c" strokeWidth="0.55"
                    strokeDasharray="4.5 3" opacity="0.42"
                  />
                  <rect
                    x="4.2" y="4.2" width="91.6" height="91.6"
                    rx="10.5" ry="8.5"
                    fill="none" stroke="#c9a86c" strokeWidth="0.32"
                    opacity="0.2"
                  />
                  {/* Corner diamond ornaments */}
                  <rect x="2.2" y="2.2" width="4" height="4" fill="#c9a86c" opacity="0.52" transform="rotate(45,4.2,4.2)" />
                  <rect x="93.8" y="2.2" width="4" height="4" fill="#c9a86c" opacity="0.52" transform="rotate(45,95.8,4.2)" />
                  <rect x="2.2" y="93.8" width="4" height="4" fill="#c9a86c" opacity="0.52" transform="rotate(45,4.2,95.8)" />
                  <rect x="93.8" y="93.8" width="4" height="4" fill="#c9a86c" opacity="0.52" transform="rotate(45,95.8,95.8)" />
                </svg>

                {/* Inner content */}
                <div className="relative z-10 flex flex-col items-center gap-6 px-7 py-9 sm:flex-row sm:items-center sm:gap-9 sm:px-11 sm:py-11 xl:px-12 xl:py-12">
                  {/* Ornate avatar medallion */}
                  <div className="relative shrink-0" style={{ width: 114, height: 114 }}>
                    <OrnateRing />
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`av-${current}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.34, ease: "easeOut" }}
                        className="absolute flex items-center justify-center overflow-hidden rounded-full border-2 border-[#b38a4a]"
                        style={{
                          inset: "14px",
                          background:
                            "radial-gradient(ellipse at 36% 28%, #f4daa2, #c08a3e)",
                        }}
                      >
                        <span
                          className="select-none text-[1.78rem] font-bold text-[#5e3a14]"
                          style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
                        >
                          {initials}
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Review text block */}
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    {/* Stars */}
                    <div className="mb-3 text-[1.1rem] tracking-[0.14em] text-[#b68840]">
                      {"★".repeat(r.stars)}
                    </div>

                    <AnimatePresence mode="wait" custom={dir}>
                      <motion.div
                        key={`rv-${current}`}
                        custom={dir}
                        variants={textVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p
                          className="text-[0.9rem] font-light leading-[1.92] text-[#4a3425] sm:text-[0.95rem] xl:text-[1.02rem]"
                        >
                          &ldquo;{r.text}&rdquo;
                        </p>
                        <p
                          className="mt-4 font-semibold text-[#5a3d26]"
                          style={{
                            fontFamily: "var(--font-cormorant-garamond), serif",
                            fontSize: "1.06rem",
                          }}
                        >
                          — {r.name}
                        </p>
                        <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.14em] text-[#8a6848]/72">
                          {r.role}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next review"
            className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#c9a86c]/32 bg-white/4 text-[1.6rem] leading-none text-[#c9a86c] backdrop-blur-sm transition-all duration-200 hover:border-[#c9a86c]/55 hover:bg-[#c9a86c]/14"
          >
            ›
          </button>
        </div>

        {/* Mobile nav arrows */}
        <div className="mt-5 flex justify-center gap-4 sm:hidden">
          <button
            onClick={prev}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a86c]/32 text-[1.35rem] text-[#c9a86c]"
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a86c]/32 text-[1.35rem] text-[#c9a86c]"
          >
            ›
          </button>
        </div>

        {/* Pill / dot indicators */}
        <div className="mt-7 flex items-center justify-center gap-2.5">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to review ${i + 1}`}
              style={{
                width: i === current ? "22px" : "7px",
                height: "7px",
                borderRadius: "999px",
                background:
                  i === current ? "#c9a86c" : "rgba(201,168,108,0.28)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.42s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          ))}
        </div>

        {/* Reviewer name pills */}
        <motion.div
          className="mt-9 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.22 }}
        >
          {REVIEWS.map((rev, i) => (
            <button
              key={rev.id}
              onClick={() => go(i)}
              style={{
                borderRadius: "13px",
                padding: "7px 16px",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.38s cubic-bezier(0.22,1,0.36,1)",
                background:
                  i === current
                    ? "linear-gradient(135deg,#c9a86c,#a87e4a)"
                    : "rgba(255,248,234,0.93)",
                color: i === current ? "#fff9f0" : "#5a4130",
                border:
                  i === current
                    ? "1px solid rgba(201,168,108,0.72)"
                    : "1px solid rgba(201,168,108,0.22)",
                boxShadow:
                  i === current
                    ? "0 6px 18px rgba(201,168,108,0.30)"
                    : "0 2px 6px rgba(0,0,0,0.10)",
                transform:
                  i === current
                    ? "scale(1.06) translateY(-1px)"
                    : "scale(1)",
              }}
            >
              {rev.name}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
