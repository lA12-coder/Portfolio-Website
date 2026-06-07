import React from 'react';
import { CalendarDays, ExternalLink, Library } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';

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
  if (!value) return 'Draft';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export default function BlogSection() {
  const { data: posts, isLoading } = trpc.portfolio.getBlogPosts.useQuery();
  const visiblePosts = (posts ?? []).slice(0, 4);
  const hasMorePosts = (posts ?? []).length > 4;

  return (
    <section id="blog" className="px-6 md:px-12 py-20 md:py-32 max-w-4xl">
      <div className="space-y-12">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Technical Blog</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
          <p className="mt-4 text-muted-foreground">
            Notes on software engineering, AI systems, security, and the practical details behind my work.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((item) => (
              <div key={item} className="h-72 animate-pulse rounded-lg border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : (posts ?? []).length > 0 ? (
          <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-2">
              {visiblePosts.map((post) => {
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
                      <h3 className="text-xl font-semibold leading-tight text-foreground">
                        <a href={`/blog/${post.slug}`} className="hover:text-accent smooth-transition">
                          {post.title}
                        </a>
                      </h3>
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

            {hasMorePosts && (
              <Button asChild variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                <a href="/blog" className="inline-flex items-center gap-2">
                  <Library size={16} />
                  Show All Posts
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
            Blog posts will appear here soon.
          </div>
        )}
      </div>
    </section>
  );
}
