import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What kind of projects do you build?',
    answer: 'I build full-stack web applications, portfolio sites, dashboards, APIs, AI-assisted tools, and clean user interfaces for practical business workflows.',
  },
  {
    question: 'Can you work on both frontend and backend tasks?',
    answer: 'Yes. I work with React, TypeScript, Tailwind CSS, Django, Node.js, REST APIs, databases, authentication, and deployment-ready application structure.',
  },
  {
    question: 'Do you take freelance or collaboration requests?',
    answer: 'Yes. The best way to start is to share the project goal, timeline, and any existing designs or technical requirements through the contact form.',
  },
  {
    question: 'What do you write about on the blog?',
    answer: 'The blog focuses on software engineering lessons, AI integration, secure backend systems, portfolio improvements, and notes from real implementation work.',
  },
  {
    question: 'How quickly do you respond?',
    answer: 'I usually review new messages as soon as possible and reply with next steps, clarifying questions, or a suggested direction for the work. For faster response contact me with my email address at lidetadmassu217@outlook.com',
  },
  {
    question: 'Which working format do you prefer?',
    answer: 'I prefer jobs with Remote work, flexible hours, and a focus on building practical applications that solve real problems. I am open to both full-time and part-time opportunities.',
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="px-6 md:px-12 py-20 md:py-28 max-w-4xl">
      <div className="space-y-10">
        <div>
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/15">
            <HelpCircle size={22} className="text-accent" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
        </div>

        <Accordion type="single" collapsible className="rounded-lg border border-white/10 bg-white/5 px-5">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`} className="border-white/10">
              <AccordionTrigger className="text-base text-foreground hover:text-accent hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
