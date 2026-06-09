import React, { useEffect, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { AIChatBox, type Message } from '@/components/AIChatBox';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Brain, Loader2, Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';

type AnalysisResult = {
  matchScore: number;
  matchedKeywords: string[];
  skillGaps: string[];
  pitch: string;
};

function createVisitorId() {
  const key = 'lidet-visitor-id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const next = crypto.randomUUID();
  localStorage.setItem(key, next);
  return next;
}

function RagChatAssistant({ visitorId }: { visitorId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const streamTimerRef = useRef<number | null>(null);
  const chatMutation = trpc.rag.chat.useMutation();

  useEffect(() => {
    return () => {
      if (streamTimerRef.current !== null) window.clearInterval(streamTimerRef.current);
    };
  }, []);

  const streamAssistantMessage = (answer: string) => {
    if (streamTimerRef.current !== null) window.clearInterval(streamTimerRef.current);

    setStreamedAnswer('');
    let index = 0;
    streamTimerRef.current = window.setInterval(() => {
      index += Math.max(2, Math.round(answer.length / 90));
      const next = answer.slice(0, index);
      setStreamedAnswer(next);

      if (index >= answer.length) {
        if (streamTimerRef.current !== null) window.clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
        setStreamedAnswer('');
        setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
      }
    }, 18);
  };

  const handleSend = async (content: string) => {
    setMessages((prev) => [...prev, { role: 'user', content }]);

    try {
      const response = await chatMutation.mutateAsync({ question: content, visitorId });
      streamAssistantMessage(response.answer);
    } catch {
      toast.error('Chat assistant could not answer right now.');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I could not answer that right now. Please try again in a moment.' },
      ]);
    }
  };

  const displayMessages = streamedAnswer
    ? [...messages, { role: 'assistant' as const, content: streamedAnswer }]
    : messages;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Ask About Lidet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask about skills, projects, experience, education, or contact details.
        </p>
      </div>
      <AIChatBox
        messages={displayMessages}
        onSendMessage={handleSend}
        isLoading={chatMutation.isPending && !streamedAnswer}
        height={420}
        placeholder="Ask a question about Lidet..."
        emptyStateMessage="Ask the portfolio assistant"
        suggestedPrompts={[
          'What are Lidet’s strongest skills?',
          'Tell me about the INSA experience',
          'Which projects use Django or React?',
        ]}
        className="border-white/10 bg-white/5"
      />
    </div>
  );
}

function ResumeAnalyzer({ visitorId }: { visitorId: string }) {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const analyzeMutation = trpc.resumeAnalyzer.analyze.useMutation();

  const canAnalyze = jobDescription.trim().length >= 100;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('text/') && !file.name.match(/\.(txt|md)$/i)) {
      toast.error('Please upload a plain text or Markdown job description.');
      return;
    }

    const text = await file.text();
    setJobDescription(text);
    toast.success('Job description loaded');
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) {
      toast.error('Paste at least 100 characters from the job description.');
      return;
    }

    try {
      const result = await analyzeMutation.mutateAsync({ jobDescription, visitorId });
      setAnalysis(result);
    } catch {
      toast.error('Resume analysis failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">AI Resume Analyzer</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste a job description to estimate match, keywords, skill gaps, and a recruiter-ready pitch.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-5">
        <Textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here..."
          className="min-h-44 border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground"
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/5 smooth-transition">
            <Upload size={16} />
            Upload TXT/MD
            <input
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending || !canAnalyze}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain size={16} className="mr-2" />
                Analyze Match
              </>
            )}
          </Button>
        </div>
      </div>

      {analysis && (
        <div className="space-y-6 rounded-lg border border-white/10 bg-white/5 p-5">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold text-foreground">Match Score</p>
              <p className="text-3xl font-bold text-accent">{analysis.matchScore}%</p>
            </div>
            <Progress value={analysis.matchScore} className="bg-white/10" />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Matched Keywords</p>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No strong keyword overlap found.</span>
                ) : analysis.matchedKeywords.map((keyword) => (
                  <span key={keyword} className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Skill Gaps</p>
              <div className="flex flex-wrap gap-2">
                {analysis.skillGaps.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No major gaps detected from the text.</span>
                ) : analysis.skillGaps.map((gap) => (
                  <span key={gap} className="rounded-full bg-amber-400/15 px-3 py-1 text-xs text-amber-300">
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-background/50 p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">Pitch</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{analysis.pitch}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InteractiveFeaturesSection() {
  const [visitorId] = useState(() => createVisitorId());

  return (
    <section id="lab" className="px-6 md:px-12 py-20 md:py-32 max-w-2xl">
      <div className="space-y-16">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles size={14} className="text-accent" />
            Interactive portfolio tools
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Interactive Lab</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
          <p className="text-muted-foreground mt-4">
            Ask the portfolio assistant and compare a job description against Lidet's resume.
          </p>
        </div>

        <RagChatAssistant visitorId={visitorId} />
        <ResumeAnalyzer visitorId={visitorId} />
      </div>
    </section>
  );
}
