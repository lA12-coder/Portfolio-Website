import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Github, Linkedin, Mail, Menu, Send} from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import type { VisualMode, WeatherMood } from '@/components/ThreeMesh';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface PortfolioLayoutProps {
  children: React.ReactNode;
}

const ThreeMesh = React.lazy(() => import('@/components/ThreeMesh'));

const modeMeta: Record<VisualMode, { label: string; color: string }> = {
  origin: { label: 'Origin', color: '#fb923c' },
  craft: { label: 'Craft', color: '#f472b6' },
  systems: { label: 'Systems', color: '#22d3ee' },
  ai: { label: 'AI', color: '#a78bfa' },
  contact: { label: 'Contact', color: '#34d399' },
};

const sectionModes: Record<string, VisualMode> = {
  home: 'origin',
  about: 'craft',
  projects: 'systems',
  experience: 'ai',
  resume: 'ai',
  contact: 'contact',
};

export default function PortfolioLayout({ children }: PortfolioLayoutProps) {
  const [location] = useLocation();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const lastScrollRef = useRef({ top: 0, time: performance.now() });
  const [webglEnabled, setWebglEnabled] = useState(false);
  const [visualMode, setVisualMode] = useState<VisualMode>('origin');
  const [activeSection, setActiveSection] = useState('home');
  const [weatherMood] = useState<WeatherMood>(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 19 ? 'night' : 'sunny';
  });
  const navItems = [
    { href: '/', label: 'Home', id: 'home' },
    { href: '/about', label: 'About', id: 'about' },
    { href: '/projects', label: 'Projects', id: 'projects' },
    { href: '/experience', label: 'Experience', id: 'experience' },
    { href: '/blog', label: 'Blog', id: 'blog' },
    { href: '/contact', label: 'Contact', id: 'contact' },
  ];

  useEffect(() => {
    const routeSection = location === '/' ? 'home' : location.replace(/^\//, '').split('/')[0] || 'home';
    setActiveSection(routeSection);
    setVisualMode(sectionModes[routeSection] ?? 'origin');
  }, [location]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setWebglEnabled(!reduceMotion);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  // Cursor spotlight effect
  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || reduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      lastPositionRef.current = { x: e.clientX, y: e.clientY };

      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        const { x, y } = lastPositionRef.current;
        if (spotlightRef.current) {
          spotlightRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        }
        frameRef.current = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleContentScroll = (event: React.UIEvent<HTMLElement>) => {
    const container = event.currentTarget;
    const top = container.scrollTop;
    const now = performance.now();
    const previous = lastScrollRef.current;
    const elapsed = Math.max(now - previous.time, 16);
    const velocity = (top - previous.top) / elapsed;
    const sections = Array.from(container.querySelectorAll<HTMLElement>('section[id]'));
    const midpoint = container.clientHeight * 0.42;
    let nextSection = activeSection;

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (rect.top - containerRect.top <= midpoint && rect.bottom - containerRect.top > midpoint) {
        nextSection = section.id;
        break;
      }
    }

    if (nextSection !== activeSection) {
      setActiveSection(nextSection);
      setVisualMode(sectionModes[nextSection] ?? 'origin');
    }

    lastScrollRef.current = { top, time: now };

    if (scrollFrameRef.current !== null) return;

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      window.dispatchEvent(
        new CustomEvent('portfolio-scroll-velocity', {
          detail: { velocity },
        })
      );
      scrollFrameRef.current = null;
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground lg:overflow-hidden">
      <a
        href="/about"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-foreground"
      >
        Skip to content
      </a>

      {/* Cursor spotlight effect */}
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed left-0 top-0 hidden h-96 w-96 rounded-full opacity-20 blur-3xl transition-opacity duration-300 will-change-transform lg:block"
        style={{
          background: 'radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, transparent 70%)',
          transform: 'translate3d(-50%, -50%, 0)',
          zIndex: 1,
        }}
      />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-background/90 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <a href="/" className="min-w-0">
            <span className="block truncate text-lg font-bold text-gradient">Lidet Admassu</span>
            <span className="block truncate text-xs text-muted-foreground">Software Engineer & AI Specialist</span>
          </a>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 border-white/20 bg-white/5"
                aria-label="Open navigation menu"
              >
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent className="border-white/10 bg-background text-foreground">
              <SheetHeader>
                <SheetTitle>Lidet Admassu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <a
                      href={item.href}
                      className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground smooth-transition"
                    >
                      {item.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto space-y-4 px-4 pb-6">
                <div className="flex gap-3">
                  <a
                    href="https://github.com/lA12-coder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 bg-white/5 p-2"
                    aria-label="GitHub"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/lidtech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 bg-white/5 p-2"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                  <a
                    href="mailto:lidetadmassu217@outlook.com"
                    className="rounded-lg border border-white/10 bg-white/5 p-2"
                    aria-label="Email"
                  >
                    <Mail size={18} />
                  </a>
                </div>
              </div>
            </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="relative z-0 flex min-h-screen overflow-visible lg:h-screen lg:overflow-hidden">
        {webglEnabled && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[100svh] overflow-hidden lg:hidden">
            <Suspense fallback={null}>
              <ThreeMesh
                weatherMood={weatherMood}
                visualMode="origin"
                accentColor={modeMeta.origin.color}
              />
            </Suspense>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,transparent_0%,rgba(255,255,255,0.78)_46%,rgba(255,255,255,0.98)_82%)] dark:bg-[radial-gradient(circle_at_72%_20%,transparent_0%,rgba(8,10,20,0.48)_42%,rgba(8,10,20,0.94)_82%)]" />
            <div className="pointer-events-none absolute inset-0 bg-background/20 dark:bg-background/15" />
          </div>
        )}

        {/* Left Column - Fixed Sidebar */}
        <aside className="relative hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:bg-gradient-to-b lg:from-background lg:to-background/80 lg:border-r lg:border-border/50 lg:p-12">
          {webglEnabled && (
            <Suspense fallback={null}>
              <ThreeMesh
                weatherMood={weatherMood}
                visualMode={visualMode}
                accentColor={modeMeta[visualMode].color}
              />
            </Suspense>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,transparent_0%,rgba(255,255,255,0.72)_42%,rgba(255,255,255,0.96)_82%)] dark:bg-[radial-gradient(circle_at_72%_38%,transparent_0%,rgba(8,10,20,0.34)_38%,rgba(8,10,20,0.86)_78%)]" />
          <div className="pointer-events-none absolute inset-0 bg-background/15 dark:bg-transparent" />
          {/* Header */}
          <div className="relative z-10 space-y-8">
            {/* Branding */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-gradient">Lidet Admassu</span>
              </h1>
              <p className="text-lg text-foreground/80 font-light">
                Software Engineer & AI Specialist
              </p>
              <p className="text-sm text-foreground/70 leading-relaxed max-w-xs dark:text-muted-foreground">
                Building elegant digital solutions with cutting-edge technology and thoughtful design.
              </p>
            </div>

            {/* Navigation */}
            <nav className="space-y-3" aria-label="Portfolio sections">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block text-sm font-medium smooth-transition ${
                    item.id && activeSection === item.id
                      ? 'translate-x-1 text-foreground'
                      : 'text-foreground/65 hover:text-foreground dark:text-muted-foreground'
                  }`}
                  style={
                    item.id && activeSection === item.id
                      ? { textShadow: `0 0 18px ${modeMeta[visualMode].color}55` }
                      : undefined
                  }
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="relative z-10 space-y-6">
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://github.com/lA12-coder"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/70 hover:bg-accent/15 smooth-transition border border-border/70 backdrop-blur"
                aria-label="GitHub"
              >
                <Github size={20} className="text-muted-foreground hover:text-foreground" />
              </a>
              <a
                href="https://www.linkedin.com/in/lidtech/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/70 hover:bg-accent/15 smooth-transition border border-border/70 backdrop-blur"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} className="text-muted-foreground hover:text-foreground" />
              </a>
              <a
                href="mailto:lidetadmassu217@outlook.com"
                className="p-2 rounded-lg bg-background/70 hover:bg-accent/15 smooth-transition border border-border/70 backdrop-blur"
                aria-label="Email"
              >
                <Mail size={20} className="text-muted-foreground hover:text-foreground" />
              </a>
              <a
                href='https://t.me/LA1623'
                target='_blank'
                rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-background/70 hover:bg-accent/15 smooth-transition border border-border/70 backdrop-blur"
                  aria-label="Telegram"
              >
                <Send size={20} className="text-muted-foreground hover:text-foreground" />
              </a>
              <a 
               href='https://leetcode.com/LILAD1/'
              target='_blank'
               rel="noopener noreferrer"
                className="p-2 rounded-lg bg-background/70 hover:bg-accent/15 smooth-transition border border-border/70 backdrop-blur"
                aria-label="LeetCode"
              >
                <span className="block min-w-5 text-center text-sm font-bold text-muted-foreground hover:text-foreground">LC</span>
              </a>
            </div>

            <ThemeToggle />

            {/* Contact Info */}
            <div className="space-y-2 text-xs text-foreground/65 dark:text-muted-foreground">
              <p>Addis Ababa, Ethiopia</p>
              <p>+251-931460438</p>
              <p>lidetadmassu217@outlook.com</p>
            </div>
          </div>
        </aside>

        {/* Right Column - Scrollable Content */}
        <main
          className="relative z-10 w-full scroll-smooth pt-20 lg:w-1/2 lg:overflow-y-auto lg:pt-0"
          onScroll={handleContentScroll}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
