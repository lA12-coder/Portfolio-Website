import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const fallbackTestimonials = [
  {
    id: 1,
    author: 'Natnael Tadesse',
    title: 'CEO',
    company: 'Phoenixopia Solution.',
    content: 'Working with Lidet was an absolute pleasure. He delivered his tasks ahead of schedule and exceeded all our expectations. The attention to detail, understanding of software architecture, and commitment to quality were evident in every aspect of the project. I highly recommend Lidet to anyone looking for a talented and reliable web developer.',
    rating: 5,
  },
  {
    id: 2,
    author: 'Hiwot Ayele',
    title: 'Founder',
    company: 'Elegance Beauty house',
    content: 'The website that Lidet created for me is absolutely stunning. The design is modern and professional, and the functionality is top-notch. I would highly recommend Lidet to anyone looking for a talented and skilled web developer.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    rating: 5,
    feedback: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: approvedTestimonials } = trpc.portfolio.getTestimonials.useQuery();
  const feedbackMutation = trpc.feedback.submit.useMutation();
  const testimonials = approvedTestimonials && approvedTestimonials.length > 0
    ? approvedTestimonials.map((testimonial) => ({
      id: testimonial.id,
      author: testimonial.authorName,
      title: testimonial.authorTitle,
      company: testimonial.authorCompany,
      content: testimonial.content,
      rating: testimonial.rating ?? 5,
    }))
    : fallbackTestimonials;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await feedbackMutation.mutateAsync(formData);
      toast.success('Thank you for your feedback!');
      setFormData({
        name: '',
        email: '',
        company: '',
        rating: 5,
        feedback: '',
      });
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="px-6 md:px-12 py-20 md:py-32 max-w-2xl">
      <div className="space-y-16">
        {/* Section Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Client Feedback</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
          <p className="text-muted-foreground mt-4">
            Don't just take my word for it. Here's what my clients have to say.
          </p>
        </div>

        {/* Testimonials */}
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-6 md:p-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 smooth-transition"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-accent text-accent"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.title}, {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback Form */}
        <div className="space-y-8 pt-8 border-t border-white/10">
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-2">Leave Your Feedback</h3>
            <p className="text-muted-foreground">
              Share your experience working with me. Your feedback helps me improve.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="feedback-name" className="text-sm font-medium text-foreground">Your Name</label>
                <Input
                  id="feedback-name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="feedback-email" className="text-sm font-medium text-foreground">Email</label>
                <Input
                  id="feedback-email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback-company" className="text-sm font-medium text-foreground">Company / Position</label>
              <Input
                id="feedback-company"
                type="text"
                placeholder="Your company or position"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    aria-label={`Set rating to ${rating} star${rating === 1 ? '' : 's'}`}
                    onClick={() => setFormData({ ...formData, rating })}
                    className="smooth-transition"
                  >
                    <Star
                      size={24}
                      className={`${
                        rating <= formData.rating
                          ? 'fill-accent text-accent'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback-message" className="text-sm font-medium text-foreground">Your Feedback</label>
              <Textarea
                id="feedback-message"
                placeholder="Share your experience working with me..."
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                required
                minLength={10}
                className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground min-h-32"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-6 rounded-lg smooth-transition"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
