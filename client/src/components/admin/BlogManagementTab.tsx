import React, { useMemo, useState } from 'react';
import { Streamdown } from 'streamdown';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import { apiUrl, assetUrl } from '@/lib/api';
import { Edit3, Loader2, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  tags: string;
  isPublished: number;
  publishedAt: string;
  order: number;
};

const emptyBlogForm: BlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImageUrl: '',
  tags: '',
  isPublished: 0,
  publishedAt: '',
  order: 0,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function toTagArray(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function parseTags(value: string | null) {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(', ') : value;
  } catch {
    return value;
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

function formatDateInput(value: Date | string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function BlogManagementTab() {
  const utils = trpc.useUtils();
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [blogForm, setBlogForm] = useState<BlogForm>(emptyBlogForm);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const blogPostsQuery = trpc.admin.getBlogPosts.useQuery();
  const createBlogPost = trpc.admin.createBlogPost.useMutation();
  const updateBlogPost = trpc.admin.updateBlogPost.useMutation();
  const deleteBlogPost = trpc.admin.deleteBlogPost.useMutation();

  const blogPayload = useMemo(() => ({
    title: blogForm.title.trim(),
    slug: slugify(blogForm.slug || blogForm.title),
    excerpt: blogForm.excerpt.trim(),
    content: blogForm.content.trim(),
    coverImageUrl: blogForm.coverImageUrl.trim(),
    tags: toTagArray(blogForm.tags),
    isPublished: Number(blogForm.isPublished) || 0,
    publishedAt: blogForm.publishedAt,
    order: Number(blogForm.order) || 0,
  }), [blogForm]);

  const resetForm = () => {
    setEditingPostId(null);
    setBlogForm(emptyBlogForm);
    setShowPreview(false);
  };

  const handleCoverUpload = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }

    try {
      setIsUploadingCover(true);
      const dataUrl = await readFileAsDataUrl(file);
      const response = await fetch(apiUrl('/api/admin/project-image'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          dataUrl,
        }),
      });
      const result = await response.json() as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Failed to upload image.');
      }

      setBlogForm((current) => ({ ...current, coverImageUrl: result.url ?? '' }));
      toast.success('Cover image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSavePost = async () => {
    try {
      if (editingPostId) {
        await updateBlogPost.mutateAsync({ id: editingPostId, data: blogPayload });
        toast.success('Blog post updated');
      } else {
        await createBlogPost.mutateAsync(blogPayload);
        toast.success('Blog post created');
      }

      resetForm();
      await utils.admin.getBlogPosts.invalidate();
      await utils.portfolio.getBlogPosts.invalidate();
    } catch {
      toast.error('Failed to save blog post');
    }
  };

  const isSaving = createBlogPost.isPending || updateBlogPost.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold">{editingPostId ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
          {editingPostId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X size={16} className="mr-1" />
              Cancel
            </Button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Title" value={blogForm.title} onChange={(event) => setBlogForm({ ...blogForm, title: event.target.value, slug: blogForm.slug || slugify(event.target.value) })} className="border-white/10 bg-white/5" />
          <Input placeholder="Slug" value={blogForm.slug} onChange={(event) => setBlogForm({ ...blogForm, slug: slugify(event.target.value) })} className="border-white/10 bg-white/5" />
          <Textarea placeholder="Excerpt" value={blogForm.excerpt} onChange={(event) => setBlogForm({ ...blogForm, excerpt: event.target.value })} className="min-h-24 border-white/10 bg-white/5 md:col-span-2" />
          <Textarea placeholder="MDX / Markdown content" value={blogForm.content} onChange={(event) => setBlogForm({ ...blogForm, content: event.target.value })} className="min-h-64 border-white/10 bg-white/5 font-mono text-sm md:col-span-2" />
          <Input placeholder="Tags, comma separated" value={blogForm.tags} onChange={(event) => setBlogForm({ ...blogForm, tags: event.target.value })} className="border-white/10 bg-white/5" />
          <Input type="number" min={0} max={999} placeholder="Order" value={blogForm.order} onChange={(event) => setBlogForm({ ...blogForm, order: Number(event.target.value) })} className="border-white/10 bg-white/5" />
          <Input type="date" value={blogForm.publishedAt} onChange={(event) => setBlogForm({ ...blogForm, publishedAt: event.target.value })} className="border-white/10 bg-white/5" />
          <select value={blogForm.isPublished} onChange={(event) => setBlogForm({ ...blogForm, isPublished: Number(event.target.value) })} className="rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground">
            <option value={0}>Draft</option>
            <option value={1}>Published</option>
          </select>
          <div className="space-y-3 md:col-span-2">
            <Input placeholder="Cover image URL" value={blogForm.coverImageUrl} onChange={(event) => setBlogForm({ ...blogForm, coverImageUrl: event.target.value })} className="border-white/10 bg-white/5" />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-foreground smooth-transition hover:bg-white/10">
              {isUploadingCover ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Upload Cover
              <input
                type="file"
                accept="image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
                className="sr-only"
                disabled={isUploadingCover}
                onChange={(event) => {
                  void handleCoverUpload(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
              />
            </label>
          </div>
          {blogForm.coverImageUrl && (
            <div className="md:col-span-2">
              <div className="aspect-[16/7] overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <img src={assetUrl(blogForm.coverImageUrl)} alt="Blog cover preview" className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleSavePost} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90">
            {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : editingPostId ? <Save size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
            {editingPostId ? 'Save Post' : 'Create Post'}
          </Button>
          <Button type="button" variant="outline" className="border-white/20" onClick={() => setShowPreview((current) => !current)}>
            {showPreview ? 'Hide Preview' : 'Preview MDX'}
          </Button>
        </div>

        {showPreview && (
          <div className="prose prose-neutral mt-6 max-w-none rounded-lg border border-white/10 bg-background p-5 dark:prose-invert prose-a:text-accent">
            <Streamdown>{blogForm.content || 'Write MDX or Markdown content to preview it here.'}</Streamdown>
          </div>
        )}
      </div>

      {blogPostsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-3">
          {(blogPostsQuery.data ?? []).map((post) => (
            <div key={post.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{post.title}</h4>
                    <Badge className={post.isPublished ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">/{post.slug}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground">{parseTags(post.tags)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20"
                    onClick={() => {
                      setEditingPostId(post.id);
                      setBlogForm({
                        title: post.title,
                        slug: post.slug,
                        excerpt: post.excerpt,
                        content: post.content,
                        coverImageUrl: post.coverImageUrl ?? '',
                        tags: parseTags(post.tags),
                        isPublished: post.isPublished ?? 0,
                        publishedAt: formatDateInput(post.publishedAt),
                        order: post.order ?? 0,
                      });
                    }}
                  >
                    <Edit3 size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    disabled={deleteBlogPost.isPending}
                    onClick={async () => {
                      try {
                        await deleteBlogPost.mutateAsync({ id: post.id });
                        toast.success('Blog post deleted');
                        await utils.admin.getBlogPosts.invalidate();
                        await utils.portfolio.getBlogPosts.invalidate();
                      } catch {
                        toast.error('Delete failed');
                      }
                    }}
                  >
                    {deleteBlogPost.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
