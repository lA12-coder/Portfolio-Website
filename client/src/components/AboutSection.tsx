import React, { useEffect, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';

const fallbackSkills = [
  { name: 'HTML/CSS', percentage: 95 },
  { name: 'JavaScript', percentage: 90 },
  { name: 'React', percentage: 90 },
  { name: 'TypeScript', percentage: 80 },
  { name: 'Django', percentage: 90 },
  { name: 'Node.js', percentage: 75 },
];

export default function AboutSection() {
  const skillsRef = useRef<HTMLDivElement>(null);
  const [skillsVisible, setSkillsVisible] = useState(false);
  const { data: dbSkills } = trpc.portfolio.getSkills.useQuery();
  const skills = dbSkills && dbSkills.length > 0 ? dbSkills : fallbackSkills;

  useEffect(() => {
    const node = skillsRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSkillsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="px-6 md:px-12 py-20 md:py-32 max-w-2xl">
      <div className="space-y-16">
        {/* Section Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">About Me</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
        </div>

        {/* Bio */}
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            I'm a dedicated software engineer with a passion for creating beautiful, functional digital experiences. With expertise in modern frontend frameworks, backend systems, and AI integration, I strive to build applications that not only look exceptional but also provide outstanding user experiences.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Beyond development, I'm deeply interested in artificial intelligence, machine learning, and how technology can solve real-world problems. I'm currently pursuing a degree in Software Engineering at Adama Science and Technology University while continuously expanding my skills through practical projects and learning.
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold tracking-tight">Technical Skills</h3>
          <div ref={skillsRef} className="space-y-6">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">{skill.percentage}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent to-orange-500 transition-[width] duration-[1200ms] ease-out motion-reduce:transition-none"
                    role="progressbar"
                    aria-label={`${skill.name} proficiency`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={skill.percentage}
                    style={{ width: skillsVisible ? `${skill.percentage}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience & Education */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Experience */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Experience</h3>
            <div className="space-y-6">
              <div className="border-l-2 border-accent pl-6 py-2">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">Fullstack Web Developer Intern</h4>
                  <span className="text-sm text-muted-foreground">2024 – 2025</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">INSA (Information Network Security Administration)</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Developed and optimized the backend layer of Sirkuni, a secure government communications tool. Worked with React, Django, REST APIs, and implemented complex features for enhanced security and performance.
                </p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight">Education</h3>
            <div className="space-y-6">
              <div className="border-l-2 border-accent pl-6 py-2">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">Bachelor of Science in Software Engineering</h4>
                  <span className="text-sm text-muted-foreground">2023 – Present</span>
                </div>
                <p className="text-sm text-muted-foreground">Adama Science and Technology University (ASTU)</p>
              </div>
              <div className="border-l-2 border-accent pl-6 py-2">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-foreground">BA in Economics</h4>
                  <span className="text-sm text-muted-foreground">2024 – Present</span>
                </div>
                <p className="text-sm text-muted-foreground">Arsi University</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Certifications</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Advanced Frontend Development - Udacity',
              'UI/UX Design Professional - Udemy',
              'React Developer Certification - Udemy',
              'Backend Development with Django - ALX',
            ].map((cert) => (
              <div key={cert} className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
