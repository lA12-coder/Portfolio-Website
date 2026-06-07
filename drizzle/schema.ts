import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Google OAuth subject identifier returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  technologies: text("technologies").notNull(), // JSON array as string
  imageUrl: text("imageUrl"),
  projectUrl: text("projectUrl"),
  githubUrl: text("githubUrl"),
  order: integer("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  percentage: integer("percentage").notNull(),
  category: varchar("category", { length: 120 }).default("Technical").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  organization: varchar("organization", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  startDate: varchar("startDate", { length: 80 }).notNull(),
  endDate: varchar("endDate", { length: 80 }).notNull(),
  description: text("description").notNull(),
  technologies: text("technologies").notNull(), // JSON array as string
  order: integer("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  issuer: varchar("issuer", { length: 255 }),
  issuedDate: varchar("issuedDate", { length: 80 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("imageUrl"),
  certificateUrl: text("certificateUrl"),
  order: integer("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  authorTitle: varchar("authorTitle", { length: 255 }).notNull(),
  authorCompany: varchar("authorCompany", { length: 255 }).notNull(),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  isApproved: integer("isApproved").default(0), // 0 = pending, 1 = approved
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

export const contactSubmissions = pgTable("contactSubmissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  message: text("message").notNull(),
  isRead: integer("isRead").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

export const ragKnowledgeBase = pgTable("ragKnowledgeBase", {
  id: serial("id").primaryKey(),
  chunkId: varchar("chunkId", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  embedding: text("embedding"), // JSON array as string (vector)
  metadata: text("metadata"), // JSON object as string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type RagKnowledgeBase = typeof ragKnowledgeBase.$inferSelect;
export type InsertRagKnowledgeBase = typeof ragKnowledgeBase.$inferInsert;

export const chatLogs = pgTable("chatLogs", {
  id: serial("id").primaryKey(),
  visitorId: varchar("visitorId", { length: 255 }).notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertChatLog = typeof chatLogs.$inferInsert;

export const resumeAnalyzerLogs = pgTable("resumeAnalyzerLogs", {
  id: serial("id").primaryKey(),
  visitorId: varchar("visitorId", { length: 255 }).notNull(),
  jobDescription: text("jobDescription").notNull(),
  matchScore: integer("matchScore"),
  analysis: text("analysis"), // JSON object as string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ResumeAnalyzerLog = typeof resumeAnalyzerLogs.$inferSelect;
export type InsertResumeAnalyzerLog = typeof resumeAnalyzerLogs.$inferInsert;
