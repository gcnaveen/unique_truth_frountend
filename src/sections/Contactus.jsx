import React, { useMemo, useState } from "react";

function PhoneIcon() {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 
             19.79 19.79 0 0 1-8.63-3.07 
             19.5 19.5 0 0 1-6-6 
             19.79 19.79 0 0 1-3.07-8.67A2 
             2 0 0 1 4.11 2h3a2 2 0 0 1 
             2 1.72c.12.9.32 1.78.59 2.64a2 
             2 0 0 1-.45 2.11L8.09 9.91a16 
             16 0 0 0 6 6l1.44-1.16a2 2 0 0 1 
             2.11-.45c.86.27 1.74.47 2.64.59a2 
             2 0 0 1 1.72 2z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 6.5h15c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5V8c0-.83.67-1.5 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M5.2 7.2 12 12.2l6.8-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z"
        fill="currentColor"
        opacity="0.25"
      />
      <path
        d="M12 22s7-5.2 7-12a7 7 0 0 0-14 0c0 6.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

const Contactus = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    message: "",
  });

  const mapsSrc = useMemo(() => {
    // Public embed URL (no API key needed).
    return "https://www.google.com/maps?q=97%2FE%2C%2016th%20Main%20Rd%2C%20SBI%20Staff%20Colony%2C%20Hoshalli%20Extension%2C%20Stage%201%2C%20Vijayanagar%2C%20Bengaluru%2C%20Karnataka%20560040&output=embed";
  }, []);
  const mapsUrl = "https://share.google/Kcx9rCxmSbXrlK5RO";

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Replace with API submission when you wire the backend.
    console.log("Contact form submit:", form);
    setForm({ fullName: "", email: "", contactNumber: "", message: "" });
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#0F2E15] py-16 sm:py-20 lg:py-24 xl:py-32"
    >
      {/* Subtle noise (premium texture, no “grid pattern”) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "256px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:max-w-[110rem]">
        {/* Heading */}
        <div className="text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.55em] text-teal-400/72 mb-4">
            GET IN TOUCH
          </p>
          <h2
            className="text-[clamp(2.35rem,5.4vw,3.2rem)] font-light leading-[1.18] text-[#fff8ef] 2xl:text-[clamp(2.8rem,4.4vw,4rem)]"
            style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
          >
            Contact <span className="italic text-[#c9a86c]">Us</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[680px] text-[0.9rem] leading-[1.92] text-[rgba(255,248,236,0.56)] xl:max-w-[860px] xl:text-[1rem]">
            Have questions? We'd love to help you discover your unique truth. Reach out and our team will get back to you shortly.
          </p>
          <div className="mx-auto mt-6 h-px w-28 bg-linear-to-r from-transparent via-[#c9a86c]/65 to-transparent" />
        </div>

        {/* Info cards */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 xl:gap-5">
          <div className="rounded-2xl border border-white/8 bg-white/4 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#c9a86c]/30 xl:p-7">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-[#0F2E15]/60 text-teal-400/75">
                <PhoneIcon />
              </div>
            </div>
            <h3 className="mt-3 text-[0.98rem] font-medium text-[#fff8ef] xl:text-[1.08rem]">
              Give Us a Call
            </h3>
            <p className="mt-1 text-[0.72rem] leading-normal text-[rgba(255,248,236,0.56)]">
              +91 96637 69899
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/4 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#c9a86c]/30 xl:p-7">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-[#0F2E15]/60 text-teal-400/75">
                <MailIcon />
              </div>
            </div>
            <h3 className="mt-3 text-[0.98rem] font-medium text-[#fff8ef] xl:text-[1.08rem]">
              Drop Us a Line
            </h3>
            <p className="mt-1 text-[0.72rem] leading-normal text-[rgba(255,248,236,0.56)]">
              uniquetruthlife@gmail.com
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/4 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#c9a86c]/30 xl:p-7">
            <div className="flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-[#0F2E15]/60 text-[#c9a86c]">
                <PinIcon />
              </div>
            </div>
            <h3 className="mt-3 text-[0.98rem] font-medium text-[#fff8ef] xl:text-[1.08rem]">
              Visit Our Office
            </h3>
            <p className="mt-1 text-[0.68rem] leading-normal text-[rgba(255,248,236,0.56)]">
              97/E, 16th Main Rd, SBI Staff Colony,
              <br />
              Hoshalli Extension, Stage 1,
              <br />
              Vijayanagar, Bengaluru, Karnataka 560040
            </p>
          </div>
        </div>

        {/* Map + form */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-start xl:gap-10">
          {/* Map */}
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/4 shadow-[0_22px_80px_rgba(0,0,0,0.22)]">
            <div className="absolute left-4 right-4 top-4 z-10 rounded-xl bg-[#0F2E15]/90 px-4 py-2 text-white/85 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
              <div className="flex items-center justify-start gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-white/10 p-1 text-[#c9a86c]">
                  <PinIcon />
                </span>
                <div className="text-[0.58rem] font-semibold leading-[1.2]">
                  <div>Bengaluru</div>
                  <div>Karnataka 560040</div>
                </div>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-[0.58rem] font-semibold text-[#c9a86c] underline underline-offset-2 transition-colors hover:text-[#dfbf89]"
              >
                Open in Google Maps
              </a>
            </div>

            <iframe
              title="Office location map"
              className="h-[350px] w-full sm:h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapsSrc}
            />
          </div>

          {/* Form */}
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#0F2E15]/55 backdrop-blur-sm shadow-[0_22px_80px_rgba(0,0,0,0.18)]">
            {/* Top accent */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-linear-to-r from-[#c9a86c] via-[#2bb0c1]/35 to-transparent" />

            <div className="relative p-7 sm:p-9">
              <h3
                className="text-[1.1rem] font-light leading-[1.2] text-[#fff8ef]"
                style={{ fontFamily: "var(--font-cormorant-garamond), serif" }}
              >
                Schedule a{" "}
                <span className="italic text-[#c9a86c]">Consultation</span> With Us
              </h3>
              <p className="mt-2 text-[0.74rem] leading-[1.6] text-[rgba(255,248,236,0.56)]">
                Fill in the form below and we'll reach out to schedule your session.
              </p>

              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <div>
                  <label className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,248,236,0.56)]">
                    Full Name *
                  </label>
                  <input
                    value={form.fullName}
                    onChange={onChange("fullName")}
                    required
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#14381f]/50 px-4 py-2 text-[0.88rem] text-[#fff8ef] placeholder:text-[rgba(255,248,236,0.42)] outline-none transition-shadow duration-200 focus:border-teal-400/35 focus:shadow-[0_0_0_4px_rgba(43,176,193,0.14)]"
                  />
                </div>

                <div>
                  <label className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,248,236,0.56)]">
                    Your Email *
                  </label>
                  <input
                    value={form.email}
                    onChange={onChange("email")}
                    required
                    type="email"
                    placeholder="Enter your email"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#14381f]/50 px-4 py-2 text-[0.88rem] text-[#fff8ef] placeholder:text-[rgba(255,248,236,0.42)] outline-none transition-shadow duration-200 focus:border-teal-400/35 focus:shadow-[0_0_0_4px_rgba(43,176,193,0.14)]"
                  />
                </div>

                <div>
                  <label className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,248,236,0.56)]">
                    Contact Number *
                  </label>
                  <input
                    value={form.contactNumber}
                    onChange={onChange("contactNumber")}
                    required
                    placeholder="Enter your contact number"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#14381f]/50 px-4 py-2 text-[0.88rem] text-[#fff8ef] placeholder:text-[rgba(255,248,236,0.42)] outline-none transition-shadow duration-200 focus:border-teal-400/35 focus:shadow-[0_0_0_4px_rgba(43,176,193,0.14)]"
                  />
                </div>

                <div>
                  <label className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,248,236,0.56)]">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={onChange("message")}
                    required
                    placeholder="Enter your message"
                    rows={4}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#14381f]/50 px-4 py-2 text-[0.88rem] text-[#fff8ef] placeholder:text-[rgba(255,248,236,0.42)] outline-none transition-shadow duration-200 focus:border-teal-400/35 focus:shadow-[0_0_0_4px_rgba(43,176,193,0.14)]"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-teal-400/35 bg-teal-400/15 py-3 text-[0.78rem] font-semibold tracking-[0.02em] text-[#d9fbff] transition-colors duration-200 hover:bg-teal-400/25 hover:border-teal-400/55"
                >
                  BOOK APPOINTMENT NOW
                  <span aria-hidden="true" className="text-[#d9fbff]">
                    &rarr;
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contactus;