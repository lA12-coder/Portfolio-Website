import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Bot, MessageCircle, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Message } from '@/components/AIChatBox';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

const AIChatBox = lazy(() => import('@/components/AIChatBox').then((module) => ({ default: module.AIChatBox })));

function getVisitorId() {
  const key = 'lidet-visitor-id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const next = crypto.randomUUID();
  localStorage.setItem(key, next);
  return next;
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamedAnswer, setStreamedAnswer] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const streamTimerRef = useRef<number | null>(null);
  const chatMutation = trpc.rag.chat.useMutation();

  useEffect(() => {
    setVisitorId(getVisitorId());

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
        setMessages((current) => [...current, { role: 'assistant', content: answer }]);
      }
    }, 18);
  };

  const handleSend = async (content: string) => {
    if (!visitorId) return;

    setMessages((current) => [...current, { role: 'user', content }]);

    try {
      const response = await chatMutation.mutateAsync({ question: content, visitorId });
      streamAssistantMessage(response.answer);
    } catch {
      toast.error('The portfolio assistant could not answer right now.');
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'Sorry, I could not answer that right now. Please try again in a moment.' },
      ]);
    }
  };

  const displayMessages = streamedAnswer
    ? [...messages, { role: 'assistant' as const, content: streamedAnswer }]
    : messages;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] max-w-[24rem] overflow-hidden rounded-lg border border-white/10 bg-background/95 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/5 p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/15">
                <Bot size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Portfolio Assistant</h2>
                <p className="mt-1 text-xs text-muted-foreground">Ask about skills, projects, or contact details.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Close chat"
            >
              <X size={17} />
            </button>
          </div>

          <Suspense fallback={<div className="h-[390px] animate-pulse bg-white/5" />}>
            <AIChatBox
              messages={displayMessages}
              onSendMessage={handleSend}
              isLoading={chatMutation.isPending && !streamedAnswer}
              height={390}
              placeholder="Ask about Lidet..."
              emptyStateMessage="How can I help?"
              suggestedPrompts={[
                'What are your strongest skills?',
                'Show me React projects',
                'How can I contact you?',
              ]}
              className="rounded-none border-0 bg-transparent shadow-none"
            />
          </Suspense>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-xl shadow-black/25 hover:bg-accent/90"
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        {isOpen ? <Sparkles size={23} /> : <MessageCircle size={23} />}
      </Button>
    </div>
  );
}
