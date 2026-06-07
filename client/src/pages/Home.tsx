import React, { Suspense, lazy, useRef } from 'react';
import PortfolioLayout from '@/components/PortfolioLayout';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import PortfolioSection from '@/components/PortfolioSection';
import ResumeSection from '@/components/ResumeSection';
import BlogSection from '@/components/BlogSection';
import NewsletterSection from '@/components/NewsletterSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FAQSection from '@/components/FAQSection';
import ContactSection from '@/components/ContactSection';

const InteractiveFeaturesSection = lazy(() => import('@/components/InteractiveFeaturesSection'));

export default function Home() {
  const portfolioRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  const handleViewWork = () => {
    portfolioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PortfolioLayout>
      <HeroSection onViewWork={handleViewWork} onContact={handleContact} />
      <AboutSection />
      <div ref={portfolioRef}>
        <PortfolioSection />
      </div>
      <ResumeSection />
      <BlogSection />
      <NewsletterSection />
      <Suspense fallback={<div className="mx-6 h-80 max-w-4xl animate-pulse rounded-lg border border-white/10 bg-white/5 md:mx-12" />}>
        <InteractiveFeaturesSection />
      </Suspense>
      <TestimonialsSection />
      <FAQSection />
      <div ref={contactRef}>
        <ContactSection />
      </div>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-12 border-t border-white/10">
        <div className="max-w-2xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Lidet Admassu</h3>
              <p className="text-sm text-muted-foreground">
                Software Engineer & AI Specialist
              </p>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Addis Ababa, Ethiopia</p>
              <p>+251-931460438</p>
              <p>lidetadmassu217@outlook.com</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Lidet Admassu. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </PortfolioLayout>
  );
}
