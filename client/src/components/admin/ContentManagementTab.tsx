import React, { useEffect, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Loader2, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

const suggestedProjectCategories = ['Web Development', 'UI/UX Design', 'Graphics Design', 'AI Tool', 'Mobile App', 'Backend API'] as const;

type ProjectForm = {
  title: string;
  description: string;
  category: string;
  technologies: string;
  imageUrl: string;
  projectUrl: string;
  githubUrl: string;
  order: number;
};

type TestimonialForm = {
  authorName: string;
  authorTitle: string;
  authorCompany: string;
  content: string;
  rating: number;
  isApproved: number;
};

type SkillForm = {
  name: string;
  percentage: number;
  category: string;
  order: number;
};

const emptyProject: ProjectForm = {
  title: '',
  description: '',
  category: 'Web Development',
  technologies: '',
  imageUrl: '',
  projectUrl: '',
  githubUrl: '',
  order: 0,
};

const emptyTestimonial: TestimonialForm = {
  authorName: '',
  authorTitle: '',
  authorCompany: '',
  content: '',
  rating: 5,
  isApproved: 1,
};

const emptySkill: SkillForm = {
  name: '',
  percentage: 80,
  category: 'Technical',
  order: 0,
};

function toTechArray(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function parseTechnologies(value: string | null) {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(', ') : value;
  } catch {
    return value;
  }
}

function looksLikeDirectImageUrl(value: string) {
  if (!value) return true;
  return value.startsWith('/uploads/') || value.startsWith('data:image/') || /\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i.test(value);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

export default function ContentManagementTab() {
  const utils = trpc.useUtils();
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProject);
  const [isUploadingProjectImage, setIsUploadingProjectImage] = useState(false);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>(emptyTestimonial);
  const [skillForm, setSkillForm] = useState<SkillForm>(emptySkill);

  const projectsQuery = trpc.admin.getProjects.useQuery();
  const testimonialsQuery = trpc.admin.getTestimonials.useQuery();
  const skillsQuery = trpc.admin.getSkills.useQuery();

  const createProject = trpc.admin.createProject.useMutation();
  const updateProject = trpc.admin.updateProject.useMutation();
  const deleteProject = trpc.admin.deleteProject.useMutation();
  const createTestimonial = trpc.admin.createTestimonial.useMutation();
  const updateTestimonial = trpc.admin.updateTestimonial.useMutation();
  const deleteTestimonial = trpc.admin.deleteTestimonial.useMutation();
  const createSkill = trpc.admin.createSkill.useMutation();
  const updateSkill = trpc.admin.updateSkill.useMutation();
  const deleteSkill = trpc.admin.deleteSkill.useMutation();

  const projectPayload = useMemo(() => ({
    title: projectForm.title.trim(),
    description: projectForm.description.trim(),
    category: projectForm.category,
    technologies: toTechArray(projectForm.technologies),
    imageUrl: projectForm.imageUrl.trim(),
    projectUrl: projectForm.projectUrl.trim(),
    githubUrl: projectForm.githubUrl.trim(),
    order: Number(projectForm.order) || 0,
  }), [projectForm]);
  const projectImageUrl = projectForm.imageUrl.trim();
  const imageUrlLooksDirect = looksLikeDirectImageUrl(projectImageUrl);

  useEffect(() => {
    setImagePreviewFailed(false);
  }, [projectImageUrl]);

  const resetProject = () => {
    setEditingProjectId(null);
    setProjectForm(emptyProject);
  };

  const resetTestimonial = () => {
    setEditingTestimonialId(null);
    setTestimonialForm(emptyTestimonial);
  };

  const resetSkill = () => {
    setEditingSkillId(null);
    setSkillForm(emptySkill);
  };

  const handleSaveProject = async () => {
    if (projectPayload.technologies.length === 0) {
      toast.error('Add at least one technology.');
      return;
    }

    try {
      if (editingProjectId) {
        await updateProject.mutateAsync({ id: editingProjectId, data: projectPayload });
        toast.success('Project updated');
      } else {
        await createProject.mutateAsync(projectPayload);
        toast.success('Project created');
      }
      resetProject();
      await utils.admin.getProjects.invalidate();
      await utils.portfolio.getProjects.invalidate();
    } catch {
      toast.error('Failed to save project');
    }
  };

  const handleProjectImageUpload = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller.');
      return;
    }

    try {
      setIsUploadingProjectImage(true);
      const dataUrl = await readFileAsDataUrl(file);
      const response = await fetch('/api/admin/project-image', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          dataUrl,
        }),
      });
      const result = await response.json() as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.error || 'Failed to upload image.');
      }

      setProjectForm((current) => ({ ...current, imageUrl: result.url ?? '' }));
      toast.success('Project image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingProjectImage(false);
    }
  };

  const handleSaveTestimonial = async () => {
    try {
      if (editingTestimonialId) {
        await updateTestimonial.mutateAsync({ id: editingTestimonialId, data: testimonialForm });
        toast.success('Testimonial updated');
      } else {
        await createTestimonial.mutateAsync(testimonialForm);
        toast.success('Testimonial created');
      }
      resetTestimonial();
      await utils.admin.getTestimonials.invalidate();
      await utils.admin.getPendingTestimonials.invalidate();
      await utils.portfolio.getTestimonials.invalidate();
    } catch {
      toast.error('Failed to save testimonial');
    }
  };

  const handleSaveSkill = async () => {
    try {
      if (editingSkillId) {
        await updateSkill.mutateAsync({ id: editingSkillId, data: skillForm });
        toast.success('Skill updated');
      } else {
        await createSkill.mutateAsync(skillForm);
        toast.success('Skill created');
      }
      resetSkill();
      await utils.admin.getSkills.invalidate();
      await utils.portfolio.getSkills.invalidate();
    } catch {
      toast.error('Failed to save skill');
    }
  };

  const isSavingProject = createProject.isPending || updateProject.isPending;
  const isSavingTestimonial = createTestimonial.isPending || updateTestimonial.isPending;
  const isSavingSkill = createSkill.isPending || updateSkill.isPending;

  return (
    <Tabs defaultValue="projects" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 border border-white/10 bg-white/5">
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
      </TabsList>

      <TabsContent value="projects" className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">{editingProjectId ? 'Edit Project' : 'Create Project'}</h3>
            {editingProjectId && (
              <Button variant="ghost" size="sm" onClick={resetProject}>
                <X size={16} className="mr-1" />
                Cancel
              </Button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Title" value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} className="border-white/10 bg-white/5" />
            <div>
              <Input
                list="project-category-suggestions"
                placeholder="Category"
                value={projectForm.category}
                onChange={(event) => setProjectForm({ ...projectForm, category: event.target.value })}
                className="border-white/10 bg-white/5"
              />
              <datalist id="project-category-suggestions">
                {suggestedProjectCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <Input placeholder="Technologies, comma separated" value={projectForm.technologies} onChange={(event) => setProjectForm({ ...projectForm, technologies: event.target.value })} className="border-white/10 bg-white/5 md:col-span-2" />
            <Textarea placeholder="Description" value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} className="min-h-28 border-white/10 bg-white/5 md:col-span-2" />
            <Input placeholder="Live URL" value={projectForm.projectUrl} onChange={(event) => setProjectForm({ ...projectForm, projectUrl: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="GitHub URL" value={projectForm.githubUrl} onChange={(event) => setProjectForm({ ...projectForm, githubUrl: event.target.value })} className="border-white/10 bg-white/5" />
            <div className="space-y-3">
              <Input placeholder="Direct image URL (.png, .jpg, .webp)" value={projectForm.imageUrl} onChange={(event) => setProjectForm({ ...projectForm, imageUrl: event.target.value })} className="border-white/10 bg-white/5" />
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-foreground smooth-transition hover:bg-white/10">
                  {isUploadingProjectImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Upload Image
                  <input
                    type="file"
                    accept="image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
                    className="sr-only"
                    disabled={isUploadingProjectImage}
                    onChange={(event) => {
                      void handleProjectImageUpload(event.target.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
                {projectImageUrl.startsWith('/uploads/') && (
                  <span className="text-xs text-emerald-300">Uploaded image ready</span>
                )}
              </div>
              {projectImageUrl && !imageUrlLooksDirect && (
                <p className="text-xs text-amber-300">
                  This looks like a web page URL. Upload an image or use a direct image URL ending in .png, .jpg, .webp, etc.
                </p>
              )}
              {projectImageUrl && imagePreviewFailed && (
                <p className="text-xs text-red-300">
                  Image preview failed. The URL is not loading as a public image.
                </p>
              )}
            </div>
            <Input type="number" min={0} max={999} placeholder="Order" value={projectForm.order} onChange={(event) => setProjectForm({ ...projectForm, order: Number(event.target.value) })} className="border-white/10 bg-white/5" />
            {projectImageUrl && (
              <div className="md:col-span-2">
                <div className="relative h-40 overflow-hidden rounded-lg border border-white/10 bg-white/5">
                  {!imagePreviewFailed ? (
                    <img
                      src={projectImageUrl}
                      alt="Project image preview"
                      className="h-full w-full object-cover"
                      onError={() => setImagePreviewFailed(true)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                      Image preview unavailable
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button onClick={handleSaveProject} disabled={isSavingProject} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            {isSavingProject ? <Loader2 size={16} className="mr-2 animate-spin" /> : editingProjectId ? <Save size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
            {editingProjectId ? 'Save Project' : 'Create Project'}
          </Button>
        </div>

        {projectsQuery.isLoading ? <Loader /> : (
          <div className="space-y-3">
            {(projectsQuery.data ?? []).map((project) => (
              <div key={project.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{project.title}</h4>
                      <Badge className="bg-white/10 text-foreground">{project.category}</Badge>
                      <span className="text-xs text-muted-foreground">Order {project.order ?? 0}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    <p className="text-xs text-muted-foreground">{parseTechnologies(project.technologies)}</p>
                  </div>
                  <RowActions
                    onEdit={() => {
                      setEditingProjectId(project.id);
                      setProjectForm({
                        title: project.title,
                        description: project.description,
                        category: project.category,
                        technologies: parseTechnologies(project.technologies),
                        imageUrl: project.imageUrl ?? '',
                        projectUrl: project.projectUrl ?? '',
                        githubUrl: project.githubUrl ?? '',
                        order: project.order ?? 0,
                      });
                    }}
                    onDelete={async () => {
                      await deleteProject.mutateAsync({ id: project.id });
                      toast.success('Project deleted');
                      await utils.admin.getProjects.invalidate();
                      await utils.portfolio.getProjects.invalidate();
                    }}
                    deleting={deleteProject.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="testimonials" className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">{editingTestimonialId ? 'Edit Testimonial' : 'Create Testimonial'}</h3>
            {editingTestimonialId && <Button variant="ghost" size="sm" onClick={resetTestimonial}><X size={16} className="mr-1" />Cancel</Button>}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input placeholder="Author name" value={testimonialForm.authorName} onChange={(event) => setTestimonialForm({ ...testimonialForm, authorName: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Title" value={testimonialForm.authorTitle} onChange={(event) => setTestimonialForm({ ...testimonialForm, authorTitle: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Company" value={testimonialForm.authorCompany} onChange={(event) => setTestimonialForm({ ...testimonialForm, authorCompany: event.target.value })} className="border-white/10 bg-white/5" />
            <Textarea placeholder="Content" value={testimonialForm.content} onChange={(event) => setTestimonialForm({ ...testimonialForm, content: event.target.value })} className="min-h-28 border-white/10 bg-white/5 md:col-span-3" />
            <Input type="number" min={1} max={5} value={testimonialForm.rating} onChange={(event) => setTestimonialForm({ ...testimonialForm, rating: Number(event.target.value) })} className="border-white/10 bg-white/5" />
            <select value={testimonialForm.isApproved} onChange={(event) => setTestimonialForm({ ...testimonialForm, isApproved: Number(event.target.value) })} className="rounded-md border border-white/10 bg-background px-3 py-2 text-sm text-foreground">
              <option value={1}>Approved</option>
              <option value={0}>Pending</option>
            </select>
          </div>
          <Button onClick={handleSaveTestimonial} disabled={isSavingTestimonial} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            {isSavingTestimonial ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save Testimonial
          </Button>
        </div>

        {testimonialsQuery.isLoading ? <Loader /> : (
          <div className="space-y-3">
            {(testimonialsQuery.data ?? []).map((testimonial) => (
              <div key={testimonial.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{testimonial.authorName}</h4>
                      <Badge className={testimonial.isApproved ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}>
                        {testimonial.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{testimonial.authorTitle} at {testimonial.authorCompany}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{testimonial.content}</p>
                  </div>
                  <RowActions
                    onEdit={() => {
                      setEditingTestimonialId(testimonial.id);
                      setTestimonialForm({
                        authorName: testimonial.authorName,
                        authorTitle: testimonial.authorTitle,
                        authorCompany: testimonial.authorCompany,
                        content: testimonial.content,
                        rating: testimonial.rating ?? 5,
                        isApproved: testimonial.isApproved ?? 0,
                      });
                    }}
                    onDelete={async () => {
                      await deleteTestimonial.mutateAsync({ id: testimonial.id });
                      toast.success('Testimonial deleted');
                      await utils.admin.getTestimonials.invalidate();
                      await utils.admin.getPendingTestimonials.invalidate();
                      await utils.portfolio.getTestimonials.invalidate();
                    }}
                    deleting={deleteTestimonial.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="skills" className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">{editingSkillId ? 'Edit Skill' : 'Create Skill'}</h3>
            {editingSkillId && <Button variant="ghost" size="sm" onClick={resetSkill}><X size={16} className="mr-1" />Cancel</Button>}
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Input placeholder="Name" value={skillForm.name} onChange={(event) => setSkillForm({ ...skillForm, name: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Category" value={skillForm.category} onChange={(event) => setSkillForm({ ...skillForm, category: event.target.value })} className="border-white/10 bg-white/5" />
            <Input type="number" min={0} max={100} value={skillForm.percentage} onChange={(event) => setSkillForm({ ...skillForm, percentage: Number(event.target.value) })} className="border-white/10 bg-white/5" />
            <Input type="number" min={0} max={999} value={skillForm.order} onChange={(event) => setSkillForm({ ...skillForm, order: Number(event.target.value) })} className="border-white/10 bg-white/5" />
          </div>
          <Button onClick={handleSaveSkill} disabled={isSavingSkill} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            {isSavingSkill ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save Skill
          </Button>
        </div>

        {skillsQuery.isLoading ? <Loader /> : (
          <div className="space-y-3">
            {(skillsQuery.data ?? []).map((skill) => (
              <div key={skill.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{skill.name}</h4>
                      <Badge className="bg-white/10 text-foreground">{skill.category}</Badge>
                      <span className="text-xs text-muted-foreground">Order {skill.order ?? 0}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${skill.percentage}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{skill.percentage}%</p>
                  </div>
                  <RowActions
                    onEdit={() => {
                      setEditingSkillId(skill.id);
                      setSkillForm({
                        name: skill.name,
                        percentage: skill.percentage,
                        category: skill.category,
                        order: skill.order ?? 0,
                      });
                    }}
                    onDelete={async () => {
                      await deleteSkill.mutateAsync({ id: skill.id });
                      toast.success('Skill deleted');
                      await utils.admin.getSkills.invalidate();
                      await utils.portfolio.getSkills.invalidate();
                    }}
                    deleting={deleteSkill.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
    </div>
  );
}

function RowActions({ onEdit, onDelete, deleting }: { onEdit: () => void; onDelete: () => Promise<void>; deleting: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="flex shrink-0 gap-2">
      <Button variant="outline" size="sm" className="border-white/20" onClick={onEdit}>
        <Edit3 size={16} className="mr-1" />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        disabled={deleting || isDeleting}
        onClick={async () => {
          setIsDeleting(true);
          try {
            await onDelete();
          } catch {
            toast.error('Delete failed');
          } finally {
            setIsDeleting(false);
          }
        }}
      >
        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </Button>
    </div>
  );
}
