import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { Link } from "wouter";

import { RESUME_PDF_URL } from "@/const";
import { buttonVariants } from "@/components/ui/button";
import { assetUrl } from "@/lib/api";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

export default function ResumePage() {
  const resumeQuery = trpc.portfolio.getResume.useQuery();
  const resumeUrl = assetUrl(resumeQuery.data?.url ?? RESUME_PDF_URL);
  const downloadUrl = resumeUrl.includes("/api/resume/pdf") ? `${resumeUrl}?download=1` : resumeUrl;
  const resumeFileName = resumeQuery.data?.fileName ?? "lidet-admassu-resume.pdf";
  const updatedAt = resumeQuery.data?.updatedAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(resumeQuery.data.updatedAt))
    : null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground smooth-transition hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back to portfolio
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Lidet Admassu Resume
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Software Engineer and AI Specialist. Download the resume or open the PDF directly.
              </p>
              {updatedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {updatedAt}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={downloadUrl}
              download={resumeFileName}
              className={cn(buttonVariants({ size: "lg" }), "rounded-lg")}
            >
              <Download size={18} />
              Download
            </a>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-lg")}
            >
              <ExternalLink size={18} />
              Open PDF
            </a>
          </div>
        </header>

        <section className="rounded-lg border border-white/10 bg-white/5 p-6 text-sm leading-6 text-muted-foreground">
          The embedded resume preview has been removed. Use the buttons above to download the file or open the PDF in your browser.
        </section>
      </div>
    </main>
  );
}
