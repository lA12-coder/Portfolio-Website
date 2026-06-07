import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Streamdown } from 'streamdown';

export default function ChatLogsTab() {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: chatLogs, isLoading } = trpc.admin.getChatLogs.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!chatLogs || chatLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No chat logs yet. Chat logs will appear here once visitors use the RAG assistant.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {chatLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-2">Question</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{log.question}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </p>
              </div>
              <Button
                onClick={() => {
                  setSelectedLog(log);
                  setIsOpen(true);
                }}
                variant="outline"
                size="sm"
                className="border-white/20"
              >
                <Eye size={16} className="mr-1" />
                View
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-background border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chat Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Question</p>
                <p className="text-foreground">{selectedLog.question}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Answer</p>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <Streamdown>{selectedLog.answer}</Streamdown>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Visitor ID</p>
                <p className="text-foreground text-xs font-mono">{selectedLog.visitorId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Timestamp</p>
                <p className="text-foreground">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
