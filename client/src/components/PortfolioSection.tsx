import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { assetUrl } from '@/lib/api';
import { trpc } from '@/lib/trpc';
import { ExternalLink, Github } from 'lucide-react';

const fallbackProjects = [
  {
    id: 1,
    title: 'Laundry Management System',
    description: 'This laundry system helps to automates the manual order tracking, financial management, rider assignment, logistics, and partner laundry management. It contains 3 dashboards suchas user dashboard, rider dashboard and partner laundry dashboard.',
    category: 'Web Development',
    technologies: ['React', 'Tailwind CSS', 'Django', 'Docker', 'Git', 'PostgreSQL'],
    visual: 'Laundry Management',
    palette: 'from-rose-400/30 via-orange-400/20 to-amber-300/10',
    imageUrl: null,
    projectUrl: null,
    githubUrl: 'https://github.com/lA12-coder/',
  },
  {
    id: 2,
    title: 'SafeGround',
    description: 'SafeGround is a full-stack, privacy-first digital well-being and AI powered pornography addiction recovery platform purposefully engineered for Ethiopian youth. The application treats addiction as a hidden crisis by replacing stigma with an anonymous digital sanctuary.',
    category: 'Web Development',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'AI', 'Supabase'],
    visual: 'SafeGround',
    palette: 'from-emerald-400/30 via-cyan-400/20 to-lime-300/10',
    imageUrl: null,
    projectUrl: 'https://safeground-project-12x6.vercel.app/',
    githubUrl: 'https://github.com/lA12-coder/safeground-project',
  },
  {
    id: 3,
    title: 'Elegance Beauty',
    description: 'Elegance Beauty is an intuitive appointment scheduling and management website with a clean, modern UI designed for real client use. Focused on accessibility, smooth UX, and seamless scheduling workflows for women\'s beauty service businesses.',
    category: 'Web Development',
    technologies: ['React', 'Tailwind CSS', 'Node.js', 'MySQL', 'Express.js', 'Git'],
    visual: 'Elegance Beauty',
    palette: 'from-sky-400/30 via-violet-400/20 to-orange-300/10',
    imageUrl: null,
    projectUrl: 'https://elegance-beauty-house.netlify.app/',
    githubUrl: 'https://github.com/lA12-coder/Beauty-House-Management-System',
  },
  {
    id: 4,
    title: 'Laundry Management System UI/UX Design',
    description: 'It is multi-page user interface design for a Landry management system website that I have designed using Figma.',
    category: 'UI/UX Design',
    technologies: ['Figma'],
    visual: 'Laundry UI/UX',
    palette: 'from-amber-400/30 via-slate-300/15 to-teal-300/10',
    imageUrl: null,
    projectUrl: 'https://www.figma.com/proto/OeND6H6gi2pnOsCRyjS4s0/Untitled?node-id=1-227&p=f&t=HDD74OfPQ1XNsG9g-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A227',
    githubUrl: null,
  },
  {
    id: 5,
    title: "Ethiopian University Student's collaboration and learning platform Design",
    description: 'A collaborative platform for Ethiopian university students to share resources, collaborate on projects, and enhance their learning experience.',
    category: 'UI/UX Design',
    technologies: ['Figma'],
    visual: 'Student Platform',
    palette: 'from-rose-400/30 via-orange-400/20 to-amber-300/10',
    imageUrl: null,
    projectUrl: 'https://www.figma.com/proto/QVUtmws7BL7LYN3ZbPkLzq/E-hub-for-University-Students-Across-Ethiopia?node-id=1-60&starting-point-node-id=2343%3A366&t=jOBX5VB1wxgsmhAv-1',
    githubUrl: null,
  },
  {
    id: 6,
    title: 'Ecommerce API',
    description: 'A comprehensive e-commerce backend API built with Django Rest Framework featuring complete product management and order processing.',
    category: 'Backend',
    technologies: ['Django', 'Django Rest Framework', 'MySQL', 'Swagger UI'],
    visual: 'API',
    palette: 'from-emerald-400/30 via-cyan-400/20 to-lime-300/10',
    imageUrl: null,
    projectUrl: null,
    githubUrl: 'https://github.com/lA12-coder/Ecommerce-API',
  },
  {
    id: 7,
    title: 'Modern Fitness Website Landing Page',
    description: 'It is a modern, responsive landing page for a Fitness website.',
    category: 'Web Development',
    technologies: ['React', 'TailwindCSS', 'Framer-Motion'],
    visual: 'Fitness Landing',
    palette: 'from-sky-400/30 via-violet-400/20 to-orange-300/10',
    imageUrl: null,
    projectUrl: 'https://fitnessclubgymwebsite.netlify.app/',
    githubUrl: null,
  },
];

const palettes = [
  'from-rose-400/30 via-orange-400/20 to-amber-300/10',
  'from-emerald-400/30 via-cyan-400/20 to-lime-300/10',
  'from-sky-400/30 via-violet-400/20 to-orange-300/10',
  'from-amber-400/30 via-slate-300/15 to-teal-300/10',
];

function parseTechnologies(value: string | string[]) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value.split(',').map((item) => item.trim()).filter(Boolean);
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

function ProjectPreview({
  imageUrl,
  title,
  category,
  visual,
  palette,
}: {
  imageUrl: string | null;
  title: string;
  category: string;
  visual: string;
  palette: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <div className={`relative h-64 md:h-72 overflow-hidden bg-gradient-to-br ${palette}`}>
      {showImage ? (
        <>
          <img
            src={assetUrl(imageUrl)}
            alt={`${title} preview`}
            className="absolute inset-0 h-full w-full object-cover smooth-transition group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/15 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="absolute left-6 top-6 right-6 rounded-lg border border-white/10 bg-background/55 p-4 backdrop-blur-sm group-hover:translate-y-1 smooth-transition">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-3">
              <div className="h-3 w-2/3 rounded-full bg-white/30" />
              <div className="h-3 w-full rounded-full bg-white/15" />
              <div className="h-3 w-4/5 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </>
      )}
      <div className="absolute bottom-6 left-6 rounded-lg border border-white/10 bg-background/70 px-4 py-3 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{category}</p>
        <p className="text-2xl font-bold text-foreground">{visual}</p>
      </div>
    </div>
  );
}

export default function PortfolioSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: dbProjects } = trpc.portfolio.getProjects.useQuery();
  const projects = dbProjects && dbProjects.length > 0
    ? dbProjects.map((project, index) => ({
      ...project,
      technologies: parseTechnologies(project.technologies),
      imageUrl: project.imageUrl?.trim() || null,
      visual: project.title.split(/\s+/).slice(0, 2).join(' '),
      palette: palettes[index % palettes.length],
    }))
    : fallbackProjects;
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((project) => project.category))).filter(Boolean)],
    [projects]
  );

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className="px-6 md:px-12 py-20 md:py-32 max-w-4xl">
      <div className="space-y-16">
        {/* Section Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Projects</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-accent to-transparent rounded-full" />
          <p className="text-muted-foreground mt-4">
            A selection of my recent projects showcasing my skills and expertise.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`rounded-full smooth-transition ${
                selectedCategory === category
                  ? 'bg-accent text-accent-foreground'
                  : 'border-white/20 hover:bg-white/5'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8">
          {filteredProjects.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center text-muted-foreground">
              No projects in this category yet.
            </div>
          )}

          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-lg overflow-hidden border border-white/10 hover:border-accent/50 bg-white/5 hover:bg-white/10 smooth-transition"
            >
              <ProjectPreview
                imageUrl={project.imageUrl}
                title={project.title}
                category={project.category}
                visual={project.visual}
                palette={project.palette}
              />

              {/* Project Info */}
              <div className="p-6 md:p-8 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-accent smooth-transition">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-white/10 text-foreground hover:bg-white/20 smooth-transition"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-3 pt-4">
                  {project.projectUrl && project.projectUrl !== '#' && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground font-medium smooth-transition"
                    >
                      View Project
                      <ExternalLink size={16} />
                    </a>
                  )}
                  {project.githubUrl && project.githubUrl !== '#' && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/5 text-foreground font-medium smooth-transition"
                    >
                      GitHub
                      <Github size={16} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
