import { TRPCError } from "@trpc/server";

export const technicalKeywords = [
  "react",
  "typescript",
  "javascript",
  "html",
  "css",
  "tailwind",
  "django",
  "node",
  "express",
  "mysql",
  "postgresql",
  "rest",
  "api",
  "authentication",
  "authorization",
  "docker",
  "aws",
  "next.js",
  "vite",
  "python",
  "ai",
  "llm",
  "rag",
  "embeddings",
  "frontend",
  "backend",
  "full-stack",
  "ui/ux",
];

export type BlogPostFormInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  isPublished: number;
  publishedAt?: string;
  order: number;
};

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export function blogPostValues(input: BlogPostFormInput) {
  const normalizedSlug = slugify(input.slug || input.title);

  if (!normalizedSlug) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Blog post slug must contain at least one letter or number.",
    });
  }

  const publishedAt = input.isPublished
    ? input.publishedAt
      ? new Date(input.publishedAt)
      : new Date()
    : input.publishedAt
      ? new Date(input.publishedAt)
      : null;

  if (publishedAt && Number.isNaN(publishedAt.getTime())) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Published date is invalid.",
    });
  }

  return {
    title: input.title,
    slug: normalizedSlug,
    excerpt: input.excerpt,
    content: input.content,
    coverImageUrl: input.coverImageUrl || null,
    tags: JSON.stringify(input.tags),
    isPublished: input.isPublished,
    publishedAt,
    order: input.order,
  };
}

export function fallbackRagAnswer(question: string, context: string) {
  const normalized = question.toLowerCase();

  if (normalized.includes("contact") || normalized.includes("email") || normalized.includes("phone")) {
    return "You can reach Lidet at lidetadmassu217@outlook.com or +251-931460438. She is based in Addis Ababa, Ethiopia.";
  }

  if (normalized.includes("project") || normalized.includes("portfolio")) {
    return "Lidet's highlighted projects include Beauty House, Fitness Website, GeezGeeks, and Ecommerce API. They cover React/TypeScript frontends, Django REST APIs, startup websites, and e-commerce backend systems.";
  }

  if (normalized.includes("skill") || normalized.includes("tech")) {
    return "Lidet's strongest skills include HTML/CSS, JavaScript, React, TypeScript, Django, REST APIs, database design, Tailwind CSS, and AI integration with LLM/RAG systems.";
  }

  if (normalized.includes("experience") || normalized.includes("work") || normalized.includes("insa")) {
    return "Lidet worked as a Fullstack Web Developer Intern at INSA from 2024 to 2025, contributing to Sirkuni, a secure government communications tool, with React, Django, REST APIs, and secure authentication work.";
  }

  return `Based on Lidet's portfolio: ${context.slice(0, 700)}${context.length > 700 ? "..." : ""}`;
}

export function analyzeJobDescription(jobDescription: string) {
  const lowerDescription = jobDescription.toLowerCase();
  const matchedKeywords = technicalKeywords.filter((keyword) => lowerDescription.includes(keyword));
  const coreStrengths = ["react", "typescript", "javascript", "django", "rest", "api", "mysql", "frontend", "backend"];
  const missingCore = coreStrengths.filter((keyword) => lowerDescription.includes(keyword) && !matchedKeywords.includes(keyword));
  const requestedButUnlisted = ["kubernetes", "graphql", "java", "spring", "go", "ruby", "angular", "vue", "mobile", "react native"].filter((keyword) => lowerDescription.includes(keyword));
  const scoreBase = Math.round((matchedKeywords.length / Math.max(technicalKeywords.length * 0.42, 1)) * 100);
  const matchScore = Math.min(95, Math.max(28, scoreBase + (lowerDescription.includes("junior") || lowerDescription.includes("intern") ? 12 : 0)));

  return {
    matchScore,
    matchedKeywords,
    skillGaps: Array.from(new Set([...missingCore, ...requestedButUnlisted])).slice(0, 8),
    pitch: "Lidet is a strong fit for roles needing a full-stack engineer with React, TypeScript, Django, REST API, database, and AI integration experience. Her INSA work shows she can contribute to secure backend systems while still caring about polished user-facing experiences.",
  };
}
