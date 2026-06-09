import React, { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';

const splashSeenKey = 'lidet-splash-seen';

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(splashSeenKey) !== 'true';
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;

    window.sessionStorage.setItem(splashSeenKey, 'true');
    const start = window.performance.now();
    const minimumDuration = 300;

    const finish = () => {
      const elapsed = window.performance.now() - start;
      const delay = Math.max(0, minimumDuration - elapsed);

      window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => setVisible(false), 420);
      }, delay);
    };

    if (document.readyState === 'complete') {
      finish();
      return;
    }

    window.addEventListener('load', finish, { once: true });
    return () => window.removeEventListener('load', finish);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center bg-background transition-opacity duration-500 ${leaving ? 'opacity-0' : 'opacity-100'}`}
      aria-label="Loading portfolio"
    >
      <div className="relative flex w-full max-w-sm flex-col items-center px-6 text-center">
        <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 shadow-2xl shadow-black/20">
          <Sparkles className="h-8 w-8 animate-pulse text-accent" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Lidet Admassu</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Portfolio Loading</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Preparing the projects, writing, and assistant experience.
        </p>
        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 animate-[pulse_1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-accent via-amber-300 to-orange-500" />
        </div>
      </div>
    </div>
  );
}

export function GlobalApiLoader() {
  const pendingRequests = useIsFetching() + useIsMutating();

  if (pendingRequests === 0) return null;

  return (
    <div className="fixed right-5 top-5 z-[60] hidden items-center gap-2 rounded-lg border border-white/10 bg-background/90 px-3 py-2 text-xs font-medium text-muted-foreground shadow-lg shadow-black/20 backdrop-blur-md md:flex">
      <Loader2 size={14} className="animate-spin text-accent" />
      Loading
    </div>
  );
}
