import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, MailOpen, Mail, Trash2, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead: number | null;
  createdAt: Date;
};

export default function ContactSubmissionsTab() {
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: submissions, isLoading, refetch } = trpc.admin.getContactSubmissions.useQuery();
  const markReadMutation = trpc.admin.markContactAsRead.useMutation();
  const markUnreadMutation = trpc.admin.markContactAsUnread.useMutation();
  const deleteMutation = trpc.admin.deleteContactSubmission.useMutation();

  const handleView = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsOpen(true);

    if (!submission.isRead) {
      try {
        await markReadMutation.mutateAsync({ id: submission.id });
        refetch();
      } catch {
        toast.error('Failed to mark submission as read');
      }
    }
  };

  const handleToggleRead = async (submission: ContactSubmission) => {
    try {
      if (submission.isRead) {
        await markUnreadMutation.mutateAsync({ id: submission.id });
        toast.success('Submission marked as unread');
      } else {
        await markReadMutation.mutateAsync({ id: submission.id });
        toast.success('Submission marked as read');
      }

      refetch();
    } catch {
      toast.error('Failed to update submission status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Submission deleted');
      refetch();
    } catch {
      toast.error('Failed to delete submission');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12 p-6 rounded-lg border border-white/10 bg-white/5">
        <p className="text-muted-foreground">No contact submissions yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div
            key={submission.id}
            className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{submission.name}</h3>
                  <span
                    className={
                      submission.isRead
                        ? 'px-2 py-1 text-xs rounded-full bg-white/10 text-muted-foreground'
                        : 'px-2 py-1 text-xs rounded-full bg-accent/20 text-accent'
                    }
                  >
                    {submission.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
                <a
                  href={`mailto:${submission.email}`}
                  className="text-sm text-muted-foreground hover:text-accent smooth-transition"
                >
                  {submission.email}
                </a>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-3">
                  {submission.message}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  onClick={() => handleView(submission)}
                  variant="outline"
                  size="sm"
                  className="border-white/20"
                >
                  <Eye size={16} className="mr-1" />
                  View
                </Button>
                <Button
                  onClick={() => handleToggleRead(submission)}
                  variant="outline"
                  size="sm"
                  className="border-white/20"
                  disabled={markReadMutation.isPending || markUnreadMutation.isPending}
                >
                  {submission.isRead ? (
                    <Mail size={16} className="mr-1" />
                  ) : (
                    <MailOpen size={16} className="mr-1" />
                  )}
                  {submission.isRead ? 'Unread' : 'Read'}
                </Button>
                <Button
                  onClick={() => handleDelete(submission.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-background border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">From</p>
                <p className="text-foreground">{selectedSubmission.name}</p>
                <a
                  href={`mailto:${selectedSubmission.email}`}
                  className="text-sm text-accent hover:text-accent/80 smooth-transition"
                >
                  {selectedSubmission.email}
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                <div className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-4 text-foreground">
                  {selectedSubmission.message}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Submitted</p>
                <p className="text-foreground">
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
