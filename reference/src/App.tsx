import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Lenis from 'lenis';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { DownloadSection } from './components/DownloadSection';
import { HowToUseSection } from './components/HowToUseSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { AboutPage } from './pages/AboutPage';

// This component can use useLocation because it's inside Router
function AppContent() {
  const location = useLocation();
  const showAboutButton = location.pathname === '/';

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
      {/* Show button only on home page */}
      {showAboutButton && (
        <div className="fixed top-6 right-6 z-50">
          <Link
            to="/about"
            className="px-4 py-2 text-sm font-mono border border-divider rounded-full text-text-secondary hover:text-text-primary hover:border-flow-shell-start/30 transition-all duration-300 backdrop-blur-sm bg-surface/30"
          >
            About
          </Link>
        </div>
      )}

      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/about" element={
          <>
            <HeroSection />
            <FeaturesSection />
            <DownloadSection />
            <HowToUseSection />
            <ContactSection />
            <Footer />
          </>
        } />
      </Routes>
    </main>
  );
}

// Main App component just wraps everything with Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}