import FeatureSection from "@/components/FeatureSection";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />

      <Hero />
      <FeatureSection/>
      <HowItWorks/>
    </>
  );
}
