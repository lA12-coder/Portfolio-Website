import React, { useEffect, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { apiUrl, assetUrl } from '@/lib/api';
import { Edit3, ExternalLink, Loader2, Plus, Save, Trash2, Upload, X } from 'lucide-react';
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

type ExperienceForm = {
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string;
  order: number;
};

type CertificateForm = {
  title: string;
  issuer: string;
  issuedDate: string;
  description: string;
  imageUrl: string;
  certificateUrl: string;
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

const emptyExperience: ExperienceForm = {
  title: '',
  organization: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
  technologies: '',
  order: 0,
};

const emptyCertificate: CertificateForm = {
  title: '',
  issuer: '',
  issuedDate: '',
  description: '',
  imageUrl: '',
  certificateUrl: '',
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

function looksLikeCertificateImageUrl(value: string) {
  if (!value) return true;
  return value.startsWith('/uploads/certificates/') || value.startsWith('data:image/') || /\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i.test(value);
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
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [editingCertificateId, setEditingCertificateId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProject);
  const [isUploadingProjectImage, setIsUploadingProjectImage] = useState(false);
  const [isUploadingCertificateImage, setIsUploadingCertificateImage] = useState(false);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const [certificateImagePreviewFailed, setCertificateImagePreviewFailed] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>(emptyTestimonial);
  const [skillForm, setSkillForm] = useState<SkillForm>(emptySkill);
  const [experienceForm, setExperienceForm] = useState<ExperienceForm>(emptyExperience);
  const [certificateForm, setCertificateForm] = useState<CertificateForm>(emptyCertificate);

  const projectsQuery = trpc.admin.getProjects.useQuery();
  const testimonialsQuery = trpc.admin.getTestimonials.useQuery();
  const skillsQuery = trpc.admin.getSkills.useQuery();
  const experiencesQuery = trpc.admin.getExperiences.useQuery();
  const certificatesQuery = trpc.admin.getCertificates.useQuery();

  const createProject = trpc.admin.createProject.useMutation();
  const updateProject = trpc.admin.updateProject.useMutation();
  const deleteProject = trpc.admin.deleteProject.useMutation();
  const createTestimonial = trpc.admin.createTestimonial.useMutation();
  const updateTestimonial = trpc.admin.updateTestimonial.useMutation();
  const deleteTestimonial = trpc.admin.deleteTestimonial.useMutation();
  const createSkill = trpc.admin.createSkill.useMutation();
  const updateSkill = trpc.admin.updateSkill.useMutation();
  const deleteSkill = trpc.admin.deleteSkill.useMutation();
  const createExperience = trpc.admin.createExperience.useMutation();
  const updateExperience = trpc.admin.updateExperience.useMutation();
  const deleteExperience = trpc.admin.deleteExperience.useMutation();
  const createCertificate = trpc.admin.createCertificate.useMutation();
  const updateCertificate = trpc.admin.updateCertificate.useMutation();
  const deleteCertificate = trpc.admin.deleteCertificate.useMutation();

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
  const certificateImageUrl = certificateForm.imageUrl.trim();
  const certificateImageUrlLooksDirect = looksLikeCertificateImageUrl(certificateImageUrl);
  const experiencePayload = useMemo(() => ({
    title: experienceForm.title.trim(),
    organization: experienceForm.organization.trim(),
    location: experienceForm.location.trim(),
    startDate: experienceForm.startDate.trim(),
    endDate: experienceForm.endDate.trim(),
    description: experienceForm.description.trim(),
    technologies: toTechArray(experienceForm.technologies),
    order: Number(experienceForm.order) || 0,
  }), [experienceForm]);
  const certificatePayload = useMemo(() => ({
    title: certificateForm.title.trim(),
    issuer: certificateForm.issuer.trim(),
    issuedDate: certificateForm.issuedDate.trim(),
    description: certificateForm.description.trim(),
    imageUrl: certificateForm.imageUrl.trim(),
    certificateUrl: certificateForm.certificateUrl.trim(),
    order: Number(certificateForm.order) || 0,
  }), [certificateForm]);

  useEffect(() => {
    setImagePreviewFailed(false);
  }, [projectImageUrl]);

  useEffect(() => {
    setCertificateImagePreviewFailed(false);
  }, [certificateImageUrl]);

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

  const resetExperience = () => {
    setEditingExperienceId(null);
    setExperienceForm(emptyExperience);
  };

  const resetCertificate = () => {
    setEditingCertificateId(null);
    setCertificateForm(emptyCertificate);
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
      const response = await fetch(apiUrl('/api/admin/project-image'), {
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
      toast.success('Project image ready. Save the project to store it in the database.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingProjectImage(false);
    }
  };

  const handleCertificateImageUpload = async (file: File | undefined) => {
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
      setIsUploadingCertificateImage(true);
      const dataUrl = await readFileAsDataUrl(file);
      const response = await fetch(apiUrl('/api/admin/certificate-image'), {
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

      setCertificateForm((current) => ({ ...current, imageUrl: result.url ?? '' }));
      toast.success('Certificate image ready. Save the certificate to store it in the database.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploadingCertificateImage(false);
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

  const handleSaveExperience = async () => {
    try {
      if (editingExperienceId) {
        await updateExperience.mutateAsync({ id: editingExperienceId, data: experiencePayload });
        toast.success('Experience updated');
      } else {
        await createExperience.mutateAsync(experiencePayload);
        toast.success('Experience created');
      }
      resetExperience();
      await utils.admin.getExperiences.invalidate();
      await utils.portfolio.getExperiences.invalidate();
    } catch {
      toast.error('Failed to save experience');
    }
  };

  const handleSaveCertificate = async () => {
    try {
      if (editingCertificateId) {
        await updateCertificate.mutateAsync({ id: editingCertificateId, data: certificatePayload });
        toast.success('Certificate updated');
      } else {
        await createCertificate.mutateAsync(certificatePayload);
        toast.success('Certificate created');
      }
      resetCertificate();
      await utils.admin.getCertificates.invalidate();
      await utils.portfolio.getCertificates.invalidate();
    } catch {
      toast.error('Failed to save certificate');
    }
  };

  const isSavingProject = createProject.isPending || updateProject.isPending;
  const isSavingTestimonial = createTestimonial.isPending || updateTestimonial.isPending;
  const isSavingSkill = createSkill.isPending || updateSkill.isPending;
  const isSavingExperience = createExperience.isPending || updateExperience.isPending;
  const isSavingCertificate = createCertificate.isPending || updateCertificate.isPending;

  return (
    <Tabs defaultValue="projects" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 border border-white/10 bg-white/5 md:grid-cols-5">
        <TabsTrigger value="projects">Projects</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="experiences">Experiences</TabsTrigger>
        <TabsTrigger value="certificates">Certificates</TabsTrigger>
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
              <Input placeholder="Direct image URL or uploaded database image" value={projectForm.imageUrl} onChange={(event) => setProjectForm({ ...projectForm, imageUrl: event.target.value })} className="border-white/10 bg-white/5" />
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
                {projectImageUrl.startsWith('data:image/') && (
                  <span className="text-xs text-emerald-300">Database image ready. Save to persist.</span>
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
                      src={assetUrl(projectImageUrl)}
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

      <TabsContent value="experiences" className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">{editingExperienceId ? 'Edit Experience' : 'Create Experience'}</h3>
            {editingExperienceId && <Button variant="ghost" size="sm" onClick={resetExperience}><X size={16} className="mr-1" />Cancel</Button>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Role / title" value={experienceForm.title} onChange={(event) => setExperienceForm({ ...experienceForm, title: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Organization" value={experienceForm.organization} onChange={(event) => setExperienceForm({ ...experienceForm, organization: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Location" value={experienceForm.location} onChange={(event) => setExperienceForm({ ...experienceForm, location: event.target.value })} className="border-white/10 bg-white/5" />
            <Input type="number" min={0} max={999} placeholder="Order" value={experienceForm.order} onChange={(event) => setExperienceForm({ ...experienceForm, order: Number(event.target.value) })} className="border-white/10 bg-white/5" />
            <Input placeholder="Start date, e.g. 2024" value={experienceForm.startDate} onChange={(event) => setExperienceForm({ ...experienceForm, startDate: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="End date, e.g. Present" value={experienceForm.endDate} onChange={(event) => setExperienceForm({ ...experienceForm, endDate: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Technologies, comma separated" value={experienceForm.technologies} onChange={(event) => setExperienceForm({ ...experienceForm, technologies: event.target.value })} className="border-white/10 bg-white/5 md:col-span-2" />
            <Textarea placeholder="Description" value={experienceForm.description} onChange={(event) => setExperienceForm({ ...experienceForm, description: event.target.value })} className="min-h-28 border-white/10 bg-white/5 md:col-span-2" />
          </div>
          <Button onClick={handleSaveExperience} disabled={isSavingExperience} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            {isSavingExperience ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save Experience
          </Button>
        </div>

        {experiencesQuery.isLoading ? <Loader /> : (
          <div className="space-y-3">
            {(experiencesQuery.data ?? []).map((experience) => (
              <div key={experience.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold">{experience.title}</h4>
                      <Badge className="bg-white/10 text-foreground">{experience.organization}</Badge>
                      <span className="text-xs text-muted-foreground">Order {experience.order ?? 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {experience.startDate} - {experience.endDate}{experience.location ? ` · ${experience.location}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{experience.description}</p>
                    <p className="text-xs text-muted-foreground">{parseTechnologies(experience.technologies)}</p>
                  </div>
                  <RowActions
                    onEdit={() => {
                      setEditingExperienceId(experience.id);
                      setExperienceForm({
                        title: experience.title,
                        organization: experience.organization,
                        location: experience.location ?? '',
                        startDate: experience.startDate,
                        endDate: experience.endDate,
                        description: experience.description,
                        technologies: parseTechnologies(experience.technologies),
                        order: experience.order ?? 0,
                      });
                    }}
                    onDelete={async () => {
                      await deleteExperience.mutateAsync({ id: experience.id });
                      toast.success('Experience deleted');
                      await utils.admin.getExperiences.invalidate();
                      await utils.portfolio.getExperiences.invalidate();
                    }}
                    deleting={deleteExperience.isPending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="certificates" className="space-y-6">
        <div className="rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-semibold">{editingCertificateId ? 'Edit Certificate' : 'Create Certificate'}</h3>
            {editingCertificateId && <Button variant="ghost" size="sm" onClick={resetCertificate}><X size={16} className="mr-1" />Cancel</Button>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Certificate title" value={certificateForm.title} onChange={(event) => setCertificateForm({ ...certificateForm, title: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Issuer, e.g. NASA Space Apps" value={certificateForm.issuer} onChange={(event) => setCertificateForm({ ...certificateForm, issuer: event.target.value })} className="border-white/10 bg-white/5" />
            <Input placeholder="Issued date, e.g. 10/7/2026" value={certificateForm.issuedDate} onChange={(event) => setCertificateForm({ ...certificateForm, issuedDate: event.target.value })} className="border-white/10 bg-white/5" />
            <Input type="number" min={0} max={999} placeholder="Order" value={certificateForm.order} onChange={(event) => setCertificateForm({ ...certificateForm, order: Number(event.target.value) })} className="border-white/10 bg-white/5" />
            <Input placeholder="View certificate URL" value={certificateForm.certificateUrl} onChange={(event) => setCertificateForm({ ...certificateForm, certificateUrl: event.target.value })} className="border-white/10 bg-white/5 md:col-span-2" />
            <Textarea placeholder="Description" value={certificateForm.description} onChange={(event) => setCertificateForm({ ...certificateForm, description: event.target.value })} className="min-h-28 border-white/10 bg-white/5 md:col-span-2" />
            <div className="space-y-3 md:col-span-2">
              <Input placeholder="Certificate image URL or uploaded database image" value={certificateForm.imageUrl} onChange={(event) => setCertificateForm({ ...certificateForm, imageUrl: event.target.value })} className="border-white/10 bg-white/5" />
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-foreground smooth-transition hover:bg-white/10">
                  {isUploadingCertificateImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Upload Image
                  <input
                    type="file"
                    accept="image/avif,image/gif,image/jpeg,image/png,image/svg+xml,image/webp"
                    className="sr-only"
                    disabled={isUploadingCertificateImage}
                    onChange={(event) => {
                      void handleCertificateImageUpload(event.target.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
                {certificateImageUrl.startsWith('data:image/') && (
                  <span className="text-xs text-emerald-300">Database image ready. Save to persist.</span>
                )}
              </div>
              {certificateImageUrl && !certificateImageUrlLooksDirect && (
                <p className="text-xs text-amber-300">
                  This looks like a web page URL. Upload an image or use a direct image URL ending in .png, .jpg, .webp, etc.
                </p>
              )}
              {certificateImageUrl && certificateImagePreviewFailed && (
                <p className="text-xs text-red-300">
                  Image preview failed. The URL is not loading as a public image.
                </p>
              )}
            </div>
            {certificateImageUrl && (
              <div className="md:col-span-2">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                  {!certificateImagePreviewFailed ? (
                    <img
                      src={assetUrl(certificateImageUrl)}
                      alt="Certificate image preview"
                      className="h-full w-full object-cover"
                      onError={() => setCertificateImagePreviewFailed(true)}
                    />
                  ) : (
                    <span className="px-3 text-center text-xs text-muted-foreground">Preview unavailable</span>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button onClick={handleSaveCertificate} disabled={isSavingCertificate} className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            {isSavingCertificate ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save Certificate
          </Button>
        </div>

        {certificatesQuery.isLoading ? <Loader /> : (
          <div className="space-y-3">
            {(certificatesQuery.data ?? []).map((certificate) => (
              <div key={certificate.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                      {certificate.imageUrl ? (
                        <img src={assetUrl(certificate.imageUrl)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm font-semibold text-accent">{certificate.title.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold">{certificate.title}</h4>
                        {certificate.issuer && <Badge className="bg-white/10 text-foreground">{certificate.issuer}</Badge>}
                        <span className="text-xs text-muted-foreground">Order {certificate.order ?? 0}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Issued: {certificate.issuedDate}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{certificate.description}</p>
                      {certificate.certificateUrl && (
                        <a href={certificate.certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                          View Certificate
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                  <RowActions
                    onEdit={() => {
                      setEditingCertificateId(certificate.id);
                      setCertificateForm({
                        title: certificate.title,
                        issuer: certificate.issuer ?? '',
                        issuedDate: certificate.issuedDate,
                        description: certificate.description,
                        imageUrl: certificate.imageUrl ?? '',
                        certificateUrl: certificate.certificateUrl ?? '',
                        order: certificate.order ?? 0,
                      });
                    }}
                    onDelete={async () => {
                      await deleteCertificate.mutateAsync({ id: certificate.id });
                      toast.success('Certificate deleted');
                      await utils.admin.getCertificates.invalidate();
                      await utils.portfolio.getCertificates.invalidate();
                    }}
                    deleting={deleteCertificate.isPending}
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
