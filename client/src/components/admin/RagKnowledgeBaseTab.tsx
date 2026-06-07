import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RagKnowledgeBaseTab() {
  const [content, setContent] = useState('');

  const { data: chunks, isLoading, refetch } = trpc.admin.getRagKnowledgeBase.useQuery();
  const uploadMutation = trpc.admin.uploadRagContent.useMutation();
  const deleteMutation = trpc.admin.deleteRagChunk.useMutation();
  const estimateTokens = (value: string) => Math.ceil(value.trim().split(/\s+/).filter(Boolean).length * 1.3);

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

  return (
    <div className="space-y-8">
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
