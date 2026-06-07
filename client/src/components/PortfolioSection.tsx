import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { ExternalLink, Github } from 'lucide-react';

const fallbackProjects = [
  {
    id: 1,
    title: 'Beauty House',
    description: 'A full-featured appointment management website for a women\'s beauty house with real-time booking and customer management.',
    category: 'Web Development',
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    visual: 'Appointments',
    palette: 'from-rose-400/30 via-orange-400/20 to-amber-300/10',
    imageUrl: null,
    projectUrl: '#',
    githubUrl: 'https://github.com/lA12-coder/Beauty-House',
  },
  {
    id: 2,
    title: 'Fitness Website',
    description: 'A modern fitness or gym website designed to promote a fitness business and attract more customers with engaging content.',
    category: 'Web Development',
    technologies: ['React.js', 'Tailwind CSS'],
    visual: 'Fitness',
    palette: 'from-emerald-400/30 via-cyan-400/20 to-lime-300/10',
    imageUrl: null,
    projectUrl: '#',
    githubUrl: '#',
  },
  {
    id: 3,
    title: 'GeezGeeks',
    description: 'A professional website for an Ethiopian tech startup showcasing services and building brand presence in the tech community.',
    category: 'Web Development',
    technologies: ['Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    visual: 'Startup',
    palette: 'from-sky-400/30 via-violet-400/20 to-orange-300/10',
    imageUrl: null,
    projectUrl: '#',
    githubUrl: '#',
  },
  {
    id: 4,
    title: 'Ecommerce API',
    description: 'A comprehensive e-commerce backend API built with Django Rest Framework featuring complete product management and order processing.',
    category: 'Web Development',
    technologies: ['Django', 'Django Rest Framework', 'MySQL', 'Swagger UI'],
    visual: 'API',
    palette: 'from-amber-400/30 via-slate-300/15 to-teal-300/10',
    imageUrl: null,
    projectUrl: '#',
    githubUrl: 'https://github.com/lA12-coder/Ecommerce-API',
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
            src={imageUrl ?? undefined}
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
    <section id="portfolio" className="px-6 md:px-12 py-20 md:py-32 max-w-2xl">
      <div className="space-y-16">
        {/* Section Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Portfolio</h2>
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
