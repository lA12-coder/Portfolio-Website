import React from 'react';
import { Streamdown } from 'streamdown';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useRoute } from 'wouter';
import PortfolioLayout from '@/components/PortfolioLayout';
import { assetUrl } from '@/lib/api';
import { trpc } from '@/lib/trpc';

function parseTags(value: string | string[] | null) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
}

function formatDate(value: Date | string | null) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
}

export default function BlogPostPage() {
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug ?? '';
  const { data: post, isLoading, error } = trpc.portfolio.getBlogPostBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const tags = parseTags(post?.tags ?? null);

  return (
    <PortfolioLayout>
      <article id="blog" className="px-6 md:px-12 py-20 md:py-32 max-w-4xl">
        <a href="/blog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
          <ArrowLeft size={16} />
          Back to Blog
        </a>

        {isLoading ? (
          <div className="space-y-6">
            <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
            <div className="h-72 animate-pulse rounded-lg border border-white/10 bg-white/5" />
            <div className="space-y-3">
              <div className="h-4 animate-pulse rounded bg-white/10" />
              <div className="h-4 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        ) : error || !post ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8">
            <h1 className="text-2xl font-bold text-foreground">Article not found</h1>
            <p className="mt-3 text-muted-foreground">This blog post is unavailable or has not been published.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <header className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays size={16} />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{post.title}</h1>
              <p className="text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {post.coverImageUrl && (
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <img src={assetUrl(post.coverImageUrl)} alt="" className="w-full object-cover" />
              </div>
            )}

            <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-accent prose-strong:text-foreground prose-code:text-accent">
              <Streamdown>{post.content}</Streamdown>
            </div>
          </div>
        )}
      </article>
    </PortfolioLayout>
  );
}
