import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { TemplateGrid } from '@/components/landing/TemplateGrid';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { PricingSection } from '@/components/landing/PricingSection';

const Index = () => {
  return (
    <div className="relative min-h-screen cosmic-site-unified">
      <div className="relative z-10">
        {/* Scattered bright stars for the full page */}
        <div className="bright-star" style={{ top: '10%', left: '5%', animationDelay: '0s' }}></div>
        <div className="bright-star" style={{ top: '25%', left: '90%', animationDelay: '1.2s' }}></div>
        <div className="bright-star" style={{ top: '45%', left: '15%', animationDelay: '2.5s' }}></div>
        <div className="bright-star" style={{ top: '65%', left: '80%', animationDelay: '0.8s' }}></div>
        <div className="bright-star" style={{ top: '85%', left: '30%', animationDelay: '3.2s' }}></div>
      </div>

      <Header />
      <main className="flex-1 relative z-10 transition-colors duration-500">
        <Hero />
        <TemplateGrid />
        <Features />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
