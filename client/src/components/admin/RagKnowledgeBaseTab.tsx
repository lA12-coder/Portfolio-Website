import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { assetUrl } from '@/lib/api';
import { Download, ExternalLink, FileText, Loader2, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read PDF file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read PDF file.'));
    reader.readAsDataURL(file);
  });
}

export default function RagKnowledgeBaseTab() {
  const utils = trpc.useUtils();
  const [content, setContent] = useState('');
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const resumeQuery = trpc.admin.getResume.useQuery();
  const { data: chunks, isLoading, refetch } = trpc.admin.getRagKnowledgeBase.useQuery();
  const uploadResumeMutation = trpc.admin.uploadResumePdf.useMutation();
  const uploadMutation = trpc.admin.uploadRagContent.useMutation();
  const deleteMutation = trpc.admin.deleteRagChunk.useMutation();
  const estimateTokens = (value: string) => Math.ceil(value.trim().split(/\s+/).filter(Boolean).length * 1.3);
  const resumeUrl = assetUrl(resumeQuery.data?.url);
  const resumeFileName = resumeQuery.data?.fileName ?? 'lidet-admassu-resume.pdf';
  const resumeUpdatedAt = resumeQuery.data?.updatedAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(resumeQuery.data.updatedAt))
    : 'Bundled fallback';

  const handleUpload = async () => {
    if (!content.trim()) {
      toast.error('Please enter content');
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({ content });
      toast.success(`Content uploaded as ${result.chunksCreated} chunk${result.chunksCreated === 1 ? '' : 's'}`);
      setContent('');
      refetch();
    } catch (error) {
      toast.error('Failed to upload content');
    }
  };

  const handleDelete = async (chunkId: string) => {
    try {
      await deleteMutation.mutateAsync({ chunkId });
      toast.success('Chunk deleted');
      refetch();
    } catch {
      toast.error('Failed to delete chunk');
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF resume.');
      return;
    }

    try {
      setIsUploadingResume(true);
      const dataUrl = await readFileAsDataUrl(file);
      await uploadResumeMutation.mutateAsync({ fileName: file.name, dataUrl });
      await Promise.all([
        utils.admin.getResume.invalidate(),
        utils.portfolio.getResume.invalidate(),
      ]);
      toast.success('Resume PDF updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload resume PDF');
    } finally {
      setIsUploadingResume(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 p-6 rounded-lg border border-white/10 bg-white/5">
        <div>
          <h3 className="font-semibold text-foreground mb-2">Current Resume PDF</h3>
          <p className="text-sm text-muted-foreground">
            Upload a PDF here to update both the public preview page and every resume download button.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-background/40 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <FileText className="mt-1 h-5 w-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{resumeFileName}</p>
              <p className="text-xs text-muted-foreground">
                {resumeQuery.data?.source === 'admin' ? `Uploaded ${resumeUpdatedAt}` : resumeUpdatedAt}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {resumeUrl && (
              <>
                <a
                  href={resumeUrl}
                  download={resumeFileName}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium hover:bg-white/5 smooth-transition"
                >
                  <Download size={16} />
                  Download
                </a>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium hover:bg-white/5 smooth-transition"
                >
                  <ExternalLink size={16} />
                  Preview
                </a>
              </>
            )}
            <Button
              asChild
              disabled={isUploadingResume || uploadResumeMutation.isPending}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <label>
                {isUploadingResume || uploadResumeMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Upload PDF
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={handleResumeUpload}
                  disabled={isUploadingResume || uploadResumeMutation.isPending}
                />
              </label>
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="space-y-4 p-6 rounded-lg border border-white/10 bg-white/5">
        <div>
          <h3 className="font-semibold text-foreground mb-2">Upload Resume Content</h3>
          <p className="text-sm text-muted-foreground">
            Paste your resume or portfolio content. It will be automatically chunked and embedded for the RAG system.
          </p>
        </div>

        <Textarea
          placeholder="Paste your resume content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground min-h-48"
        />

        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending || !content.trim()}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Upload Content
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Existing Chunks */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-foreground mb-4">Knowledge Base Chunks</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : !chunks || chunks.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-lg border border-white/10 bg-white/5">
              <p className="text-muted-foreground">No chunks uploaded yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload content above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chunks.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-mono text-xs text-muted-foreground mb-2">{chunk.chunkId}</p>
                      <p className="text-sm text-foreground line-clamp-3">{chunk.content}</p>
                      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Est. tokens: {estimateTokens(chunk.content)}</span>
                        <span>Embedding: {chunk.embedding ? '✓' : '✗'}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDelete(chunk.chunkId)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {chunks && chunks.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 p-6 rounded-lg border border-white/10 bg-white/5">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Chunks</p>
            <p className="text-2xl font-bold text-accent">{chunks.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Tokens</p>
            <p className="text-2xl font-bold text-accent">
              {chunks.reduce((sum, c) => sum + estimateTokens(c.content), 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Embedded</p>
            <p className="text-2xl font-bold text-accent">
              {chunks.filter((c) => c.embedding).length}/{chunks.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
