import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { assetUrl } from '@/lib/api';
import { trpc } from '@/lib/trpc';

const skillCategories = [
  'Frontend',
  'Backend',
  'Database',
  'Language',
  'Tools',
  'AI/ML',
  'CyberSecurity',
] as const;

type SkillCategory = (typeof skillCategories)[number];
type SkillItem = {
  name: string;
  percentage: number;
  category?: string | null;
};

const skillCategoryLabels: Record<SkillCategory, string> = {
  Frontend: 'Frontend',
  Backend: 'Backend',
  Database: 'Database',
  Language: 'Languages',
  Tools: 'Tools',
  'AI/ML': 'AI/ML',
  CyberSecurity: 'Cybersecurity',
};

const fallbackSkills: SkillItem[] = [
  { name: 'HTML/CSS', percentage: 95, category: 'Frontend' },
  { name: 'React', percentage: 90, category: 'Frontend' },
  {name: 'Next.js', percentage: 90, category: 'Frontend' },
  { name: 'Tailwind CSS', percentage: 90, category: 'Frontend' },
  { name: 'TypeScript', percentage: 80, category: 'Frontend' },
  { name: 'Django', percentage: 90, category: 'Backend' },
  { name: 'Node.js', percentage: 75, category: 'Backend' },
  { name: 'REST APIs', percentage: 95, category: 'Backend' },
  { name: 'PostgreSQL', percentage: 82, category: 'Database' },
  { name: 'MongoDB', percentage: 80, category: 'Database' },
  { name: 'JavaScript', percentage: 90, category: 'Language' },
  { name: 'Python', percentage: 90, category: 'Language' },
  { name: 'Docker', percentage: 80, category: 'Tools' },
  { name: 'Kubernetes', percentage: 75, category: 'Tools' },
  { name: 'Git & Version Control', percentage: 85, category: 'Tools' },
  { name: 'AWS', percentage: 70, category: 'Tools' },
  { name: 'Figma', percentage: 80, category: 'Tools' },
  { name: 'AI/ML', percentage: 70, category: 'AI/ML' },
  { name: 'LLM & RAG Integration', percentage: 72, category: 'AI/ML' },
  { name: 'Web Security', percentage: 65, category: 'CyberSecurity' },
  { name: 'Secure Authentication', percentage: 75, category: 'CyberSecurity' },
  {name: 'Java', percentage: 70, category: 'Language'},
  {name:  'C++', percentage: 65, category: 'Language'},
];

type ExperienceItem = {
  id: number;
  title: string;
  organization: string;
  location?: string | null;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string | string[];
  order?: number | null;
};

type CertificateItem = {
  id: number;
  title: string;
  issuer?: string | null;
  issuedDate: string;
  description: string;
  imageUrl?: string | null;
  certificateUrl?: string | null;
  order?: number | null;
};

const fallbackExperiences: ExperienceItem[] = [
  {
    id: 1,
    title: 'Fullstack Web Developer Intern',
    organization: 'INSA (Information Network Security Administration)',
    location: 'Addis Ababa, Ethiopia',
    startDate: '2024',
    endDate: '2025',
    description: 'Developed and optimized the backend layer of Sirkuni, a secure government communications tool. Worked with React, Django, REST APIs, and implemented complex features for enhanced security and performance.',
    technologies: ['React', 'Django', 'REST APIs', 'Security'],
    order: 0,
  },
];

const fallbackCertificates: CertificateItem[] = [
  {
    id: 1,
    title: 'ALX Backend Development Certificate',
    issuer: 'ALX Africa ',
    issuedDate: '7/11/2025',
    description: 'I have learned Cohort 7 ALX Backend Development 8 month program and Graduated gaining a practical  skill on Python, Django, RESTfull API, MySQL. Docker and So on.',
    imageUrl: 'https://drive.google.com/file/d/1CxHafuxv-sPEvy82D0rPJosNw7L1OoQ9/view?usp=sharing',
    certificateUrl: 'https://savanna.alxafrica.com/certificates/3Gs2fCner9',
    order: 0,
  },
];

function parseList(value: string | string[]) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value.split(',').map((item) => item.trim()).filter(Boolean);
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

function normalizeSkillCategory(skill: SkillItem): SkillCategory {
  const category = skill.category?.trim().toLowerCase();
  const name = skill.name.toLowerCase();

  if (category === 'frontend') return 'Frontend';
  if (category === 'backend') return 'Backend';
  if (category === 'database' || category === 'databases') return 'Database';
  if (category === 'language' || category === 'languages') return 'Language';
  if (category === 'tools' || category === 'tooling') return 'Tools';
  if (category === 'ai/ml' || category === 'ai' || category === 'machine learning') return 'AI/ML';
  if (category === 'cybersecurity' || category === 'security' || category === 'cyber security') return 'CyberSecurity';

  if (/(react|html|css|tailwind|frontend|ui|figma)/.test(name)) return 'Frontend';
  if (/(django|node|express|api|backend|server)/.test(name)) return 'Backend';
  if (/(sql|postgres|mysql|mongo|database|supabase|noSQL|nosql)/i.test(skill.name)) return 'Database';
  if (/(javascript|typescript|python|java|go|c\+\+|language)/.test(name)) return 'Language';
  if (/(ai|ml|llm|rag|embedding|machine learning|model)/.test(name)) return 'AI/ML';
  if (/(security|auth|cyber|encryption|network)/.test(name)) return 'CyberSecurity';

  return 'Tools';
}

export default function AboutSection() {
  const skillsRef = useRef<HTMLDivElement>(null);
  const [skillsVisible, setSkillsVisible] = useState(false);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<SkillCategory>('Frontend');
  const { data: dbSkills } = trpc.portfolio.getSkills.useQuery();
  const { data: dbExperiences } = trpc.portfolio.getExperiences.useQuery();
  const { data: dbCertificates } = trpc.portfolio.getCertificates.useQuery();
  const skills = dbSkills && dbSkills.length > 0 ? dbSkills : fallbackSkills;
  const experiences = dbExperiences && dbExperiences.length > 0 ? dbExperiences : fallbackExperiences;
  const certificates = dbCertificates && dbCertificates.length > 0 ? dbCertificates : fallbackCertificates;
  const groupedSkills = skillCategories
    .map((category) => ({
      category,
      skills: skills.filter((skill) => normalizeSkillCategory(skill) === category),
    }))
    .filter((group) => group.skills.length > 0);
  const selectedSkillGroup = groupedSkills.find((group) => group.category === selectedSkillCategory) ?? groupedSkills[0];

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

  useEffect(() => {
    if (groupedSkills.length > 0 && !groupedSkills.some((group) => group.category === selectedSkillCategory)) {
      setSelectedSkillCategory(groupedSkills[0].category);
    }
  }, [groupedSkills, selectedSkillCategory]);

  return (
    <section id="about" className="px-6 md:px-12 py-20 md:py-32 max-w-4xl">
      <div className="space-y-16">
        {/* Section Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">About Me</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
        </div>

        {/* Bio */}
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground leading-relaxed">
            I'm a dedicated software engineer with a passion for creating beautiful, 
            functional digital experiences. With expertise in modern frontend frameworks, 
            backend systems, and AI integration and building complex enterprise-grade management systems, I strive to build applications that not only
             look exceptional but also provide outstanding user experiences.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Beyond development, I'm deeply interested in artificial intelligence, 
            cybersecurity and how technology can solve real-world problems. 
            I'm currently pursuing a bachelor degree in Software Engineering at Adama Science and Technology University 
            while continuously expanding my skills through practical projects and learning.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            I am the member of CSECASTU club member and the president of ASTU Enterprenuership and Innovation Club and currently I 
            am working  to establish a new startup.
          </p>
        </div>

        {/* Skills */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold tracking-tight">Technical Skills</h3>
          <div ref={skillsRef} className="grid gap-6">
            <div className="flex flex-wrap gap-2">
              {groupedSkills.map((group) => {
                const isSelected = group.category === selectedSkillGroup?.category;

                return (
                  <button
                    key={group.category}
                    type="button"
                    onClick={() => setSelectedSkillCategory(group.category)}
                    className={`rounded-md px-4 py-2 text-sm font-medium smooth-transition ${
                      isSelected
                        ? 'bg-accent text-accent-foreground shadow-sm'
                        : 'text-accent hover:bg-accent/10 hover:text-foreground'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {skillCategoryLabels[group.category]}
                  </button>
                );
              })}
            </div>

            {selectedSkillGroup && (
              <div key={selectedSkillGroup.category} className="rounded-lg border border-white/10 bg-white/5 p-5">
                <h4 className="mb-5 text-sm font-semibold uppercase tracking-wide text-accent">
                  {skillCategoryLabels[selectedSkillGroup.category]}
                </h4>
                <div className="space-y-5">
                  {selectedSkillGroup.skills.map((skill) => (
                    <div key={`${selectedSkillGroup.category}-${skill.name}`} className="space-y-2">
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
            )}
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Work Experience</h3>
          <div className="relative space-y-8">
            <div className="absolute bottom-3 left-[9px] top-3 w-px bg-gradient-to-b from-accent via-border to-transparent" />
            {experiences.map((experience) => {
              const technologies = parseList(experience.technologies);

              return (
                <article key={experience.id} className="relative pl-8">
                  <div className="absolute left-0 top-2 h-5 w-5 rounded-full border-4 border-background bg-accent shadow-[0_0_0_1px_var(--border)]" />
                  <div className="rounded-lg border border-white/10 bg-white/5 p-5 md:p-6">
                    <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-foreground">{experience.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{experience.organization}</p>
                        {experience.location && (
                          <p className="mt-1 text-xs text-muted-foreground">{experience.location}</p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                        {experience.startDate} - {experience.endDate}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {experience.description}
                    </p>
                    {technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {technologies.map((technology) => (
                          <span key={technology} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
                            {technology}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Certifications */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Certifications</h3>
          <div className="grid gap-5 md:grid-cols-2">
            {certificates.map((certificate) => (
              <article key={certificate.id} className="flex h-full flex-col rounded-lg border border-white/10 bg-white/5 p-5">
                <div className="mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-background">
                  {certificate.imageUrl ? (
                    <img
                      src={assetUrl(certificate.imageUrl)}
                      alt={`${certificate.title} logo`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-accent">
                      {certificate.title.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-semibold leading-tight text-foreground">{certificate.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Issued: {certificate.issuedDate}
                  {certificate.issuer ? ` · ${certificate.issuer}` : ''}
                </p>
                <p className="mt-5 flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                  {certificate.description}
                </p>
                {certificate.certificateUrl && (
                  <a
                    href={certificate.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-fit items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground smooth-transition hover:bg-accent/90"
                  >
                    View Certificate
                    <ExternalLink size={15} />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
