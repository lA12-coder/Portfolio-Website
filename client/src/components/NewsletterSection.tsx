import React, { useState } from 'react';
import { Bell, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const subscribeMutation = trpc.newsletter.subscribe.useMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await subscribeMutation.mutateAsync({ email });
      toast.success('You are subscribed to blog updates.');
      setEmail('');
    } catch {
      toast.error('Could not subscribe right now. Please try again.');
    }
  };

  return (
    <section id="newsletter" className="px-6 md:px-12 py-20 max-w-4xl">
      <div className="grid gap-8 rounded-lg border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_0.9fr] md:p-8">
        <div className="space-y-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/15">
            <Bell size={22} className="text-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Subscribe to the Newsletter</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Get a short email when I publish a new technical blog post about web development, AI, security, or product engineering.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-3">
          <label htmlFor="newsletter-email" className="text-sm font-medium text-foreground">Email address</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="newsletter-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 bg-background/50 border-white/10 text-foreground placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              disabled={subscribeMutation.isPending}
              className="h-11 bg-accent px-5 font-semibold text-accent-foreground hover:bg-accent/90"
            >
              {subscribeMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">No spam. Just a note when something new is published.</p>
        </form>
      </div>
    </section>
  );
}
