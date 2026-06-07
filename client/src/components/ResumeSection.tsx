import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

export default function ResumeSection() {
  const resumeUrl = 'https://drive.google.com/uc?export=download&id=1kRAseGbHdd5ZtOgTQ6Te2q-SrGYPm4WQ';

  return (
    <section id="experience" className="px-6 md:px-12 py-20 md:py-32 max-w-2xl">
      <div className="space-y-16">
        {/* Section Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Resume</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
          <p className="text-muted-foreground mt-4">
            A summary of my education, work experience, and skills.
          </p>
        </div>

        {/* Download Resume Button */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-semibold smooth-transition"
          >
            <Download size={20} />
            Download Full Resume
          </a>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-foreground font-semibold smooth-transition"
          >
            <ExternalLink size={20} />
            View Online
          </a>
        </div>

        {/* Work Experience */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold tracking-tight">Work Experience</h3>

          <div className="space-y-6">
            <div className="relative pl-8 pb-8 border-l-2 border-accent">
              {/* Timeline dot */}
              <div className="absolute -left-4 top-0 w-6 h-6 rounded-full bg-accent border-4 border-background" />

              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">Fullstack Web Developer Intern</h4>
                    <p className="text-sm text-muted-foreground mt-1">INSA (Information Network Security Administration)</p>
                  </div>
                  <span className="text-sm font-medium text-accent whitespace-nowrap">2024 – 2025</span>
                </div>

                <p className="text-muted-foreground leading-relaxed mt-3">
                  Developed and maintained the backend layer of Sirkuni, a secure government communications tool. Worked with React, Django, REST APIs, and implemented complex features for enhanced security and performance. Collaborated with cross-functional teams to optimize system architecture and improve user experience.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>Optimized backend performance, reducing API response time by 40%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>Implemented secure authentication and authorization systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-1">▸</span>
                    <span>Developed comprehensive REST API documentation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold tracking-tight">Education</h3>

          <div className="space-y-6">
            {/* ASTU */}
            <div className="relative pl-8 pb-8 border-l-2 border-accent">
              <div className="absolute -left-4 top-0 w-6 h-6 rounded-full bg-accent border-4 border-background" />

              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">Bachelor of Science in Software Engineering</h4>
                    <p className="text-sm text-muted-foreground mt-1">Adama Science and Technology University (ASTU)</p>
                  </div>
                  <span className="text-sm font-medium text-accent whitespace-nowrap">2023 – Present</span>
                </div>

                <p className="text-muted-foreground leading-relaxed mt-3">
                  Comprehensive program focusing on software development, algorithms, data structures, and practical application development. Engaged in various projects to apply theoretical knowledge in real-world scenarios.
                </p>
              </div>
            </div>

            {/* Arsi University */}
            <div className="relative pl-8 pb-8 border-l-2 border-accent">
              <div className="absolute -left-4 top-0 w-6 h-6 rounded-full bg-accent border-4 border-background" />

              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">BA in Economics</h4>
                    <p className="text-sm text-muted-foreground mt-1">Arsi University</p>
                  </div>
                  <span className="text-sm font-medium text-accent whitespace-nowrap">2024 – Present</span>
                </div>

                <p className="text-muted-foreground leading-relaxed mt-3">
                  Learning fundamental economic principles, financial analysis, and business planning. Developing analytical skills applicable to technology and business strategy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold tracking-tight">Certifications & Achievements</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Advanced Frontend Development', issuer: 'Udacity' },
              { title: 'UI/UX Design Professional', issuer: 'Udemy' },
              { title: 'React Developer Certification', issuer: 'Udemy' },
              { title: 'Backend Development with Django', issuer: 'ALX' },
              { title: 'Backend Web Development Graduate', issuer: 'ALX Africa' },
              { title: 'Frontend Web Development', issuer: 'Coursera (Udemy)' },
            ].map((cert, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 smooth-transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{cert.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cert.issuer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Summary */}
        <div className="space-y-6 p-6 md:p-8 rounded-lg bg-white/5 border border-white/10">
          <h3 className="text-xl font-bold tracking-tight">Key Skills</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Frontend</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>React & TypeScript</li>
                <li>Tailwind CSS & Modern CSS</li>
                <li>Responsive Design</li>
                <li>UI/UX Implementation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Backend</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Node.js & Express</li>
                <li>Django & Django REST</li>
                <li>Database Design (MySQL, PostgreSQL)</li>
                <li>API Development & REST</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Tools & Platforms</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Git & GitHub</li>
                <li>Docker & Containerization</li>
                <li>AWS & Cloud Services</li>
                <li>CI/CD Pipelines</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Specializations</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Full-Stack Development</li>
                <li>AI Integration</li>
                <li>Security & Authentication</li>
                <li>Performance Optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
