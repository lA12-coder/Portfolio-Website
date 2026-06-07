import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onViewWork?: () => void;
  onContact?: () => void;
}

export default function HeroSection({ onViewWork, onContact }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 py-20 md:py-0">
      {/* Mobile Header */}
      <div className="lg:hidden mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          <span className="text-gradient">Lidet Admassu</span>
        </h1>
        <p className="text-lg text-muted-foreground font-light mb-6">
          Software Engineer & AI Specialist
        </p>
      </div>

      {/* Hero Content */}
      <div className="max-w-2xl space-y-8">
        <div className="space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Crafting Digital <br />
            <span className="text-gradient">Experiences</span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            I'm a software engineering student passionate about building elegant,
            high-performance and highly secure web applications and ERP systems. 
            I am Specializing in full-stack development, 
            AI integration, and creating intuitive user experiences that solve real problems.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Button
            onClick={onViewWork}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 rounded-lg smooth-transition group"
          >
            View My Work
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 smooth-transition" />
          </Button>
          <Button
            onClick={onContact}
            variant="outline"
            className="border border-white/20 hover:bg-white/5 text-foreground font-semibold px-8 py-6 rounded-lg smooth-transition"
          >
            Contact Me
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/10">
          <div>
            <div className="text-3xl font-bold text-accent">2+</div>
            <p className="text-sm text-muted-foreground mt-2">Years of Experience</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">10+</div>
            <p className="text-sm text-muted-foreground mt-2">Projects Completed</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">100%</div>
            <p className="text-sm text-muted-foreground mt-2">Client Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 lg:hidden">
        <div className="flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <div className="w-6 h-10 border border-white/20 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
