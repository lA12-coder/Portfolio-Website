import React, { Suspense, lazy } from 'react';
import { useLocation } from 'wouter';
import PortfolioLayout from '@/components/PortfolioLayout';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ResumeSection from '@/components/ResumeSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContactSection from '@/components/ContactSection';

const InteractiveFeaturesSection = lazy(() => import('@/components/InteractiveFeaturesSection'));
const PortfolioSection = lazy(() => import('@/components/PortfolioSection'));

type PortfolioPage = 'home' | 'about' | 'projects' | 'experience' | 'contact';

const labFallback = (
  <div className="mx-6 h-80 max-w-4xl animate-pulse rounded-lg border border-white/10 bg-white/5 md:mx-12" />
);

const footerNavItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/experience', label: 'Experience' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

function Footer() {
  return (
    <footer className="px-6 md:px-12 py-12 border-t border-white/10">
      <div className="max-w-2xl space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Lidet Admassu</h3>
            <p className="text-sm text-muted-foreground">
              Software Engineer & AI Specialist
            </p>
          </div>

          <nav className="flex flex-col gap-2" aria-label="Footer navigation">
            {footerNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="w-fit text-sm font-medium text-muted-foreground smooth-transition hover:text-foreground hover:underline"
              >
                {item.label}
              </a>
            ))}
          </nav>

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
  );
}

export default function Home({ page = 'home' }: { page?: PortfolioPage }) {
  const [, setLocation] = useLocation();

  const handleViewWork = () => {
    setLocation('/projects');
  };

  const handleContact = () => {
    setLocation('/contact');
  };

  const content = {
    home: (
      <>
        <HeroSection onViewWork={handleViewWork} onContact={handleContact} />
        <Suspense fallback={labFallback}>
          <InteractiveFeaturesSection />
        </Suspense>
        <TestimonialsSection />
      </>
    ),
    about: <AboutSection variant="about" />,
    projects: (
      <Suspense fallback={labFallback}>
        <PortfolioSection />
      </Suspense>
    ),
    experience: (
      <>
        <AboutSection variant="experience" />
        <ResumeSection />
      </>
    ),
    contact: <ContactSection />,
  }[page];

  return (
    <PortfolioLayout>
      {content}
      <Footer />
    </PortfolioLayout>
  );
}
