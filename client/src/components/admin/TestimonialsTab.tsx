import React from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TestimonialsTab() {
  const { data: testimonials, isLoading, refetch } = trpc.admin.getPendingTestimonials.useQuery();
  const approveMutation = trpc.admin.approveTestimonial.useMutation();
  const rejectMutation = trpc.admin.rejectTestimonial.useMutation();

  const handleApprove = async (id: number) => {
    try {
      await approveMutation.mutateAsync({ id });
      toast.success('Testimonial approved!');
      refetch();
    } catch (error) {
      toast.error('Failed to approve testimonial');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMutation.mutateAsync({ id });
      toast.success('Testimonial rejected');
      refetch();
    } catch (error) {
      toast.error('Failed to reject testimonial');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pending testimonials.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {testimonials.map((testimonial: any) => (
        <div
          key={testimonial.id}
          className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition"
        >
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground">{testimonial.authorName}</h3>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                  Pending
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {testimonial.authorTitle} at {testimonial.authorCompany}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleApprove(testimonial.id)}
                disabled={approveMutation.isPending}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                size="sm"
              >
                <CheckCircle2 size={16} className="mr-1" />
                Approve
              </Button>
              <Button
                onClick={() => handleReject(testimonial.id)}
                disabled={rejectMutation.isPending}
                variant="ghost"
                className="text-destructive hover:bg-destructive/10"
                size="sm"
              >
                <Trash2 size={16} className="mr-1" />
                Reject
              </Button>
            </div>
          </div>

          <div className="flex gap-1 mb-3">
            {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-accent text-accent" />
            ))}
          </div>

          <p className="text-foreground leading-relaxed mb-3">"{testimonial.content}"</p>

          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(testimonial.createdAt), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
}
