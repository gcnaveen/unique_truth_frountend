import React from "react";
import Hero from "../sections/Hero";
import Growthsection from "../sections/Growthsection";
import Aboutus from "../sections/Aboutus";
import Ourservices from "../sections/Ourservices";
import CustomisedServices from "../sections/CustomisedServices";
import NatureSection from "../sections/Naturesection";
import Clientreviews from "../sections/Clientreviews";
import Contactus from "../sections/Contactus";
import Footer from "../components/Footer";
// import Logomarquee from "../sections/Logomarquee";

const Homepage = () => {
  return (
    <div>
      <Hero />
      <Ourservices />
      <Aboutus />
      <Growthsection />
      <NatureSection />
      {/* <Logomarquee /> */}
      <Clientreviews />
      <Contactus />
      <Footer />
    </div>
  );
};

export default Homepage;
