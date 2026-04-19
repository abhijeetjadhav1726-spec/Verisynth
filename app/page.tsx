import Nav from '@/components/Nav';
import HeroSection from '@/components/HeroSection';
import StatStrip from '@/components/StatStrip';
import FeaturesGrid from '@/components/FeaturesGrid';
import HowItWorks from '@/components/HowItWorks';
import TrustEngine from '@/components/TrustEngine';

import CtaBanner from '@/components/CtaBanner';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <StatStrip />
        <FeaturesGrid />
        <HowItWorks />
        <TrustEngine />

        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
