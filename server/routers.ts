import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getProjects,
  getSkills,
  getExperiences,
  getCertificates,
  getApprovedTestimonials,
  getAllTestimonials,
  createContactSubmission,
  createProject,
  updateProject,
  deleteProject,
  createSkill,
  updateSkill,
  deleteSkill,
  createExperience,
  updateExperience,
  deleteExperience,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  createTestimonial,
  updateTestimonial,
  getContactSubmissions,
  markContactAsRead,
  markContactAsUnread,
  deleteContactSubmission,
  getPendingTestimonials,
  approveTestimonial,
  deleteTestimonial,
  getChatLogs,
  getRagKnowledgeBase,
  createRagChunk,
  deleteRagChunk,
  createChatLog,
  createResumeAnalyzerLog,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import {
  LIDET_PROFILE_CONTEXT,
  chunkText,
  generateChunkId,
  generateEmbedding,
  searchKnowledgeBase,
  searchTextChunks,
} from "./rag";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return next({ ctx });
});

const technicalKeywords = [
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

const projectImageUrlSchema = z
  .string()
  .refine(
    (value) => {
      if (value === "") return true;

      if (/^\/uploads\/projects\/[a-z0-9][a-z0-9._-]*\.(avif|gif|jpe?g|png|svg|webp)$/i.test(value)) {
        return true;
      }

      return z.string().url().safeParse(value).success;
    },
    { message: "Use a valid image URL or upload a project image." }
  );

const projectInputSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().min(10),
  category: z.string().min(2).max(120),
  technologies: z.array(z.string().min(1).max(60)).min(1).max(20),
  imageUrl: projectImageUrlSchema.optional(),
  projectUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0).max(999).default(0),
});

const testimonialInputSchema = z.object({
  authorName: z.string().min(2).max(255),
  authorTitle: z.string().min(2).max(255),
  authorCompany: z.string().min(2).max(255),
  content: z.string().min(10),
  rating: z.number().int().min(1).max(5).default(5),
  isApproved: z.number().int().min(0).max(1).default(0),
});

const skillInputSchema = z.object({
  name: z.string().min(1).max(255),
  percentage: z.number().int().min(0).max(100),
  category: z.string().min(1).max(120).default("Technical"),
  order: z.number().int().min(0).max(999).default(0),
});

const experienceInputSchema = z.object({
  title: z.string().min(2).max(255),
  organization: z.string().min(2).max(255),
  location: z.string().max(255).optional().or(z.literal("")),
  startDate: z.string().min(2).max(80),
  endDate: z.string().min(2).max(80),
  description: z.string().min(10),
  technologies: z.array(z.string().min(1).max(60)).max(20).default([]),
  order: z.number().int().min(0).max(999).default(0),
});

const certificateImageUrlSchema = z
  .string()
  .refine(
    (value) => {
      if (value === "") return true;

      if (/^\/uploads\/certificates\/[a-z0-9][a-z0-9._-]*\.(avif|gif|jpe?g|png|svg|webp)$/i.test(value)) {
        return true;
      }

      return z.string().url().safeParse(value).success;
    },
    { message: "Use a valid image URL or upload a certificate image." }
  );

const certificateInputSchema = z.object({
  title: z.string().min(2).max(255),
  issuer: z.string().max(255).optional().or(z.literal("")),
  issuedDate: z.string().min(2).max(80),
  description: z.string().min(10),
  imageUrl: certificateImageUrlSchema.optional(),
  certificateUrl: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0).max(999).default(0),
});

function projectValues(input: z.infer<typeof projectInputSchema>) {
  return {
    ...input,
    imageUrl: input.imageUrl || null,
    projectUrl: input.projectUrl || null,
    githubUrl: input.githubUrl || null,
    technologies: JSON.stringify(input.technologies),
  };
}

function experienceValues(input: z.infer<typeof experienceInputSchema>) {
  return {
    ...input,
    location: input.location || null,
    technologies: JSON.stringify(input.technologies),
  };
}

function certificateValues(input: z.infer<typeof certificateInputSchema>) {
  return {
    ...input,
    issuer: input.issuer || null,
    imageUrl: input.imageUrl || null,
    certificateUrl: input.certificateUrl || null,
  };
}

function fallbackRagAnswer(question: string, context: string) {
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

function analyzeJobDescription(jobDescription: string) {
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

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  portfolio: router({
    getProjects: publicProcedure.query(async () => {
      return getProjects();
    }),
    getSkills: publicProcedure.query(async () => {
      return getSkills();
    }),
    getExperiences: publicProcedure.query(async () => {
      return getExperiences();
    }),
    getCertificates: publicProcedure.query(async () => {
      return getCertificates();
    }),
    getTestimonials: publicProcedure.query(async () => {
      return getApprovedTestimonials();
    }),
  }),
  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        await createContactSubmission(input);
        await notifyOwner({
          title: "New Contact Form Submission",
          content: `From: ${input.name} (${input.email})\n\n${input.message}`,
        });
        return { success: true };
      }),
  }),
  feedback: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        company: z.string().optional(),
        rating: z.number().min(1).max(5),
        feedback: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        await createTestimonial({
          authorName: input.name,
          authorTitle: input.company || "Client",
          authorCompany: input.company || "Independent",
          content: input.feedback,
          rating: input.rating,
          isApproved: 0,
        });
        await notifyOwner({
          title: "New Feedback Submission",
          content: `From: ${input.name}\nRating: ${input.rating}/5\n\n${input.feedback}`,
        });
        return { success: true };
      }),
  }),
  rag: router({
    chat: publicProcedure
      .input(z.object({
        question: z.string().min(2).max(1000),
        visitorId: z.string().min(1).max(128),
      }))
      .mutation(async ({ input }) => {
        const chunks = await getRagKnowledgeBase();
        let retrievedChunks: Array<{ chunkId?: string; content: string; similarity?: number }> = [];

        try {
          const hasEmbeddings = chunks.some((chunk) => Boolean(chunk.embedding));
          if (hasEmbeddings) {
            const questionEmbedding = await generateEmbedding(input.question);
            retrievedChunks = await searchKnowledgeBase(questionEmbedding, 5);
          }
        } catch (error) {
          console.warn("[RAG] Vector search unavailable, using text fallback:", error);
        }

        if (retrievedChunks.length === 0) {
          const sourceChunks = chunks.length > 0
            ? chunks
            : chunkText(LIDET_PROFILE_CONTEXT, 700).map((content, index) => ({
              chunkId: `profile_fallback_${index}`,
              content,
            }));

          retrievedChunks = searchTextChunks(input.question, sourceChunks, 5);
        }

        if (retrievedChunks.length === 0) {
          retrievedChunks = chunkText(LIDET_PROFILE_CONTEXT, 700).slice(0, 5).map((content, index) => ({
            chunkId: `profile_fallback_${index}`,
            content,
          }));
        }

        const context = retrievedChunks.map((chunk) => chunk.content).join("\n\n---\n\n");
        let answer = fallbackRagAnswer(input.question, context);

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are Lidet Admassu's portfolio assistant. Answer using only the provided context. Be concise, warm, accurate, and transparent if the context does not contain an answer.",
              },
              {
                role: "user",
                content: `Context about Lidet:\n${context}\n\nVisitor question: ${input.question}`,
              },
            ],
            max_tokens: 500,
          });

          const content = response.choices[0]?.message.content;
          if (typeof content === "string" && content.trim()) {
            answer = content.trim();
          }
        } catch (error) {
          console.warn("[RAG] LLM unavailable, using fallback answer:", error);
        }

        try {
          await createChatLog({
            visitorId: input.visitorId,
            question: input.question,
            answer,
          });
        } catch (error) {
          console.warn("[RAG] Failed to log chat:", error);
        }

        return {
          answer,
          sources: retrievedChunks.map((chunk) => ({
            chunkId: chunk.chunkId ?? "profile",
            preview: chunk.content.slice(0, 140),
            score: chunk.similarity ?? null,
          })),
        };
      }),
  }),
  resumeAnalyzer: router({
    analyze: publicProcedure
      .input(z.object({
        jobDescription: z.string().min(100).max(12000),
        visitorId: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        let result = analyzeJobDescription(input.jobDescription);

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "Analyze how well Lidet Admassu matches a job description. Return practical, honest JSON. Do not invent experience.",
              },
              {
                role: "user",
                content: `Candidate profile:\n${LIDET_PROFILE_CONTEXT}\n\nJob description:\n${input.jobDescription}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "resume_match_analysis",
                schema: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    matchScore: { type: "number", minimum: 0, maximum: 100 },
                    matchedKeywords: { type: "array", items: { type: "string" } },
                    skillGaps: { type: "array", items: { type: "string" } },
                    pitch: { type: "string" },
                  },
                  required: ["matchScore", "matchedKeywords", "skillGaps", "pitch"],
                },
              },
            },
            max_tokens: 700,
          });

          const content = response.choices[0]?.message.content;
          if (typeof content === "string") {
            const parsed = JSON.parse(content);
            result = {
              matchScore: Math.max(0, Math.min(100, Math.round(Number(parsed.matchScore) || result.matchScore))),
              matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords.slice(0, 16) : result.matchedKeywords,
              skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps.slice(0, 10) : result.skillGaps,
              pitch: typeof parsed.pitch === "string" ? parsed.pitch : result.pitch,
            };
          }
        } catch (error) {
          console.warn("[ResumeAnalyzer] LLM unavailable, using deterministic analysis:", error);
        }

        await createResumeAnalyzerLog({
          visitorId: input.visitorId,
          jobDescription: input.jobDescription,
          matchScore: result.matchScore,
          analysis: JSON.stringify(result),
        });

        return result;
      }),
  }),
  weather: router({
    getCurrent: publicProcedure
      .input(z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      }))
      .query(async ({ input }) => {
        const fallbackHour = new Date().getHours();
        const fallbackMood = fallbackHour < 6 || fallbackHour >= 19 ? "night" : "sunny";

        if (!process.env.OPENWEATHER_API_KEY) {
          return {
            temperature: 22,
            condition: fallbackMood === "night" ? "Clear night" : "Clear",
            humidity: 48,
            windSpeed: 2,
            location: "Your area",
            mood: fallbackMood,
            isFallback: true,
          };
        }

        try {
          const params = new URLSearchParams({
            lat: String(input.latitude),
            lon: String(input.longitude),
            appid: process.env.OPENWEATHER_API_KEY,
            units: "metric",
          });
          const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params.toString()}`);

          if (!response.ok) {
            throw new Error(`Weather API failed: ${response.status}`);
          }

          const data = await response.json();
          const condition = String(data.weather?.[0]?.main ?? "Clear");
          const isNight = String(data.weather?.[0]?.icon ?? "").endsWith("n");
          const lowerCondition = condition.toLowerCase();
          const mood = isNight
            ? "night"
            : lowerCondition.includes("rain") || lowerCondition.includes("storm")
              ? "rainy"
              : lowerCondition.includes("cloud") || lowerCondition.includes("mist") || lowerCondition.includes("fog")
                ? "cloudy"
                : "sunny";

          return {
            temperature: Math.round(Number(data.main?.temp ?? 22)),
            condition,
            humidity: Number(data.main?.humidity ?? 0),
            windSpeed: Math.round(Number(data.wind?.speed ?? 0)),
            location: String(data.name || "Your area"),
            mood,
            isFallback: false,
          };
        } catch (error) {
          console.warn("[Weather] Using fallback weather:", error);
          return {
            temperature: 22,
            condition: fallbackMood === "night" ? "Clear night" : "Clear",
            humidity: 48,
            windSpeed: 2,
            location: "Your area",
            mood: fallbackMood,
            isFallback: true,
          };
        }
      }),
  }),
  admin: router({
    getProjects: adminProcedure.query(async () => {
      return getProjects();
    }),
    createProject: adminProcedure
      .input(projectInputSchema)
      .mutation(async ({ input }) => {
        await createProject(projectValues(input));
        return { success: true };
      }),
    updateProject: adminProcedure
      .input(z.object({ id: z.number().int().positive(), data: projectInputSchema }))
      .mutation(async ({ input }) => {
        await updateProject(input.id, projectValues(input.data));
        return { success: true };
      }),
    deleteProject: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteProject(input.id);
        return { success: true };
      }),
    getTestimonials: adminProcedure.query(async () => {
      return getAllTestimonials();
    }),
    createTestimonial: adminProcedure
      .input(testimonialInputSchema)
      .mutation(async ({ input }) => {
        await createTestimonial(input);
        return { success: true };
      }),
    updateTestimonial: adminProcedure
      .input(z.object({ id: z.number().int().positive(), data: testimonialInputSchema }))
      .mutation(async ({ input }) => {
        await updateTestimonial(input.id, input.data);
        return { success: true };
      }),
    deleteTestimonial: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteTestimonial(input.id);
        return { success: true };
      }),
    getSkills: adminProcedure.query(async () => {
      return getSkills();
    }),
    createSkill: adminProcedure
      .input(skillInputSchema)
      .mutation(async ({ input }) => {
        await createSkill(input);
        return { success: true };
      }),
    updateSkill: adminProcedure
      .input(z.object({ id: z.number().int().positive(), data: skillInputSchema }))
      .mutation(async ({ input }) => {
        await updateSkill(input.id, input.data);
        return { success: true };
      }),
    deleteSkill: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteSkill(input.id);
        return { success: true };
      }),
    getExperiences: adminProcedure.query(async () => {
      return getExperiences();
    }),
    createExperience: adminProcedure
      .input(experienceInputSchema)
      .mutation(async ({ input }) => {
        await createExperience(experienceValues(input));
        return { success: true };
      }),
    updateExperience: adminProcedure
      .input(z.object({ id: z.number().int().positive(), data: experienceInputSchema }))
      .mutation(async ({ input }) => {
        await updateExperience(input.id, experienceValues(input.data));
        return { success: true };
      }),
    deleteExperience: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteExperience(input.id);
        return { success: true };
      }),
    getCertificates: adminProcedure.query(async () => {
      return getCertificates();
    }),
    createCertificate: adminProcedure
      .input(certificateInputSchema)
      .mutation(async ({ input }) => {
        await createCertificate(certificateValues(input));
        return { success: true };
      }),
    updateCertificate: adminProcedure
      .input(z.object({ id: z.number().int().positive(), data: certificateInputSchema }))
      .mutation(async ({ input }) => {
        await updateCertificate(input.id, certificateValues(input.data));
        return { success: true };
      }),
    deleteCertificate: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await deleteCertificate(input.id);
        return { success: true };
      }),
    getContactSubmissions: adminProcedure.query(async () => {
      return getContactSubmissions();
    }),
    markContactAsRead: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markContactAsRead(input.id);
        return { success: true };
      }),
    markContactAsUnread: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markContactAsUnread(input.id);
        return { success: true };
      }),
    deleteContactSubmission: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteContactSubmission(input.id);
        return { success: true };
      }),
    getPendingTestimonials: adminProcedure.query(async () => {
      return getPendingTestimonials();
    }),
    approveTestimonial: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await approveTestimonial(input.id);
        return { success: true };
      }),
    rejectTestimonial: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTestimonial(input.id);
        return { success: true };
      }),
    getChatLogs: adminProcedure.query(async () => {
      return getChatLogs();
    }),
    getRagKnowledgeBase: adminProcedure.query(async () => {
      return getRagKnowledgeBase();
    }),
    uploadRagContent: adminProcedure
      .input(z.object({
        content: z.string().min(20),
      }))
      .mutation(async ({ input }) => {
        const chunks = chunkText(input.content, 500);
        const timestamp = Date.now();

        for (let index = 0; index < chunks.length; index += 1) {
          let embedding: string | null = null;

          try {
            embedding = JSON.stringify(await generateEmbedding(chunks[index]));
          } catch (error) {
            console.warn("[RAG] Chunk saved without embedding:", error);
          }

          await createRagChunk({
            chunkId: generateChunkId(index, timestamp),
            content: chunks[index],
            embedding,
            metadata: JSON.stringify({
              type: "resume",
              source: "admin-upload",
              chunkIndex: index,
              totalChunks: chunks.length,
            }),
          });
        }

        return { success: true, chunksCreated: chunks.length };
      }),
    deleteRagChunk: adminProcedure
      .input(z.object({ chunkId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        await deleteRagChunk(input.chunkId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
