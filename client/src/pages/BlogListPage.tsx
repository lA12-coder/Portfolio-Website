import React from 'react';
import { ArrowLeft, CalendarDays, ExternalLink } from 'lucide-react';
import PortfolioLayout from '@/components/PortfolioLayout';
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
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default function BlogListPage() {
  const { data: posts, isLoading } = trpc.portfolio.getBlogPosts.useQuery();

  return (
    <PortfolioLayout>
      <main id="blog" className="px-6 md:px-12 py-20 md:py-32 max-w-5xl">
        <a href="/#blog" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
          <ArrowLeft size={16} />
          Back to Home
        </a>

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">All Blog Posts</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A complete collection of technical notes, implementation writeups, and practical engineering lessons.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-lg border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : (posts ?? []).length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {(posts ?? []).map((post) => {
              const tags = parseTags(post.tags);

              return (
                <article key={post.id} className="flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  {post.coverImageUrl && (
                    <a href={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden border-b border-white/10 bg-white/5">
                      <img src={post.coverImageUrl} alt="" className="h-full w-full object-cover smooth-transition hover:scale-[1.03]" loading="lazy" />
                    </a>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays size={14} />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <h2 className="text-xl font-semibold leading-tight text-foreground">
                      <a href={`/blog/${post.slug}`} className="hover:text-accent smooth-transition">
                        {post.title}
                      </a>
                    </h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    {tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <a href={`/blog/${post.slug}`} className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-medium text-accent hover:underline">
                      Read Article
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
            Blog posts will appear here soon.
          </div>
        )}
      </main>
    </PortfolioLayout>
  );
}
