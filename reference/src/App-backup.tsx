/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import Lenis from 'lenis';
import { CustomCursor } from './components/CustomCursor';
import { HeroSection } from './components/HeroSection';
import { ProblemSection } from './components/ProblemSection';

import { FeaturesSection } from './components/FeaturesSection';
import { MechanicsSection } from './components/MechanicsSection';
import { ProcessSection } from './components/ProcessSection';
import { MarqueeSection } from './components/MarqueeSection';
import { IntegrationSection } from './components/IntegrationSection';
import { TestimonialSection } from './components/TestimonialSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="bg-background text-text-primary min-h-screen font-mono selection:bg-accent selection:text-background">
      <CustomCursor />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <MechanicsSection />
      <ProcessSection />
      <MarqueeSection />
      <IntegrationSection />
      <TestimonialSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
