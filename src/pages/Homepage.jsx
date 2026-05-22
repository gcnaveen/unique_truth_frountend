import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Hero from "../sections/Hero";
import Growthsection from "../sections/Growthsection";
import Aboutus from "../sections/Aboutus";
import Ourservices from "../sections/Ourservices";
import CustomisedServices from "../sections/CustomisedServices";
import NatureSection from "../sections/Naturesection";
import Clientreviews from "../sections/Clientreviews";
import Contactus from "../sections/Contactus";
import Footer from "../components/Footer";
import Personalizedservices from "../sections/Personalizedservices";
// import Logomarquee from "../sections/Logomarquee";

const Homepage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);

  const enquiryOptions = [
    { label: "Skills Behind Studies", path: "/skills-behind-studies" },
    { label: "Behavioral Awareness", path: "/behavioural-awareness" },
    { label: "Relationship Awareness", path: "/relationship-awareness" },
    { label: "Talent Awareness", path: "/talent-awareness" },
  ];

  useEffect(() => {
    const fromHash = (location.hash || "").replace(/^#/, "").trim();
    const fromState =
      typeof location.state?.scrollTo === "string"
        ? location.state.scrollTo.trim()
        : "";
    const scrollTarget = fromHash || fromState;

    if (!scrollTarget) return undefined;

    const timer = window.setTimeout(() => {
      document
        .getElementById(scrollTarget)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash, location.state]);

  useEffect(() => {
    document.body.style.overflow = enquiryModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [enquiryModalOpen]);

  return (
    <div>
      <Hero onEnquireClick={() => setEnquiryModalOpen(true)} />
      <section id="services">
        <Ourservices />
      </section>
      <Aboutus />
      <Growthsection />

      <Personalizedservices />
      {/* <NatureSection /> */}
      {/* <Logomarquee /> */}
      <Clientreviews />
      <Contactus />
      <Footer />

      {/* Floating enquiry button (kept above back-to-top arrows) */}
      <button
        type="button"
        onClick={() => setEnquiryModalOpen(true)}
        className="cursor-pointer fixed bottom-20 right-5 z-50 rounded-full border border-[#c9a86c]/70 bg-[#e8d5b5] px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#1a120c] shadow-[0_10px_36px_rgba(0,0,0,0.35)] transition-all duration-300 hover:bg-[#c9a86c] hover:border-[#c9a86c]"
      >
        Enquire Now
      </button>

      {enquiryModalOpen ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEnquiryModalOpen(false)}
            aria-label="Close enquiry modal"
          />
          <div className="absolute left-1/2 top-1/2 w-[min(92vw,36rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/15 bg-[#0F2E15]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#c9a86c]/85">
              Select One
            </p>
            <h3 className="mt-3 text-center text-2xl font-light text-[#fff8ef]">
              Enquiry Category
            </h3>

            <div className="mt-6 grid gap-3">
              {enquiryOptions.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setEnquiryModalOpen(false);
                    navigate(item.path);
                  }}
                  className="rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-[#c9a86c]/55 hover:bg-[#c9a86c]/12"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setEnquiryModalOpen(false)}
              className="mt-6 w-full rounded-full border border-white/20 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Homepage;
