import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

export default function ResumeSection() {
  const resumeUrl = 'https://drive.google.com/uc?export=download&id=1kRAseGbHdd5ZtOgTQ6Te2q-SrGYPm4WQ';

  return (
    <section id="experience" className="px-6 md:px-12 py-20 md:py-32 max-w-2xl">
      <div className="space-y-16">
        {/* Section Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Resume</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
          <p className="text-muted-foreground mt-4">
            A summary of my education, work experience, and skills.
          </p>
        </div>

        {/* Download Resume Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold smooth-transition"
          >
            <Download size={20} />
            Download Full Resume
          </a>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-foreground font-semibold smooth-transition"
          >
            <ExternalLink size={20} />
            View Online
          </a>
        </div>
      </div>
    </section>
  );
}
