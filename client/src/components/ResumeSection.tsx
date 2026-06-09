import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import { RESUME_PDF_URL } from '@/const';
import { assetUrl } from '@/lib/api';
import { trpc } from '@/lib/trpc';

export default function ResumeSection() {
  const resumeQuery = trpc.portfolio.getResume.useQuery();
  const resumeUrl = assetUrl(resumeQuery.data?.url ?? RESUME_PDF_URL);
  const downloadUrl = resumeUrl.includes('/api/resume/pdf') ? `${resumeUrl}?download=1` : resumeUrl;
  const resumeFileName = resumeQuery.data?.fileName ?? 'lidet-admassu-resume.pdf';

  return (
    <section id="resume" className="px-6 md:px-12 py-20 md:py-32 max-w-2xl">
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
            href={downloadUrl}
            download={resumeFileName}
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
            Open PDF
          </a>
        </div>
      </div>
    </section>
  );
}
