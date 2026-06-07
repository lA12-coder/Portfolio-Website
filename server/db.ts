import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  projects,
  skills,
  testimonials,
  contactSubmissions,
  ragKnowledgeBase,
  chatLogs,
  resumeAnalyzerLogs,
  InsertProject,
  InsertSkill,
  InsertTestimonial,
  InsertContactSubmission,
  InsertRagKnowledgeBase,
  InsertChatLog,
  InsertResumeAnalyzerLog,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, {
        prepare: false,
      });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (
      user.openId === ENV.ownerGoogleSub ||
      (user.email && user.email === ENV.ownerEmail)
    ) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(projects.order);
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(projects).values(data);
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(eq(projects.id, id));
}

export async function getSkills() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skills).orderBy(skills.order);
}

export async function createSkill(data: InsertSkill) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(skills).values(data);
}

export async function updateSkill(id: number, data: Partial<InsertSkill>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(skills).set(data).where(eq(skills.id, id));
}

export async function deleteSkill(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(skills).where(eq(skills.id, id));
}

export async function getApprovedTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(eq(testimonials.isApproved, 1));
}

export async function getAllTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
}

export async function getPendingTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(eq(testimonials.isApproved, 0)).orderBy(desc(testimonials.createdAt));
}

export async function createTestimonial(data: InsertTestimonial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(testimonials).values(data);
}

export async function approveTestimonial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(testimonials).set({ isApproved: 1 }).where(eq(testimonials.id, id));
}

export async function updateTestimonial(id: number, data: Partial<InsertTestimonial>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(testimonials).set(data).where(eq(testimonials.id, id));
}

export async function deleteTestimonial(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(testimonials).where(eq(testimonials.id, id));
}

export async function getContactSubmissions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
}

export async function createContactSubmission(data: InsertContactSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contactSubmissions).values(data);
}

export async function markContactAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactSubmissions).set({ isRead: 1 }).where(eq(contactSubmissions.id, id));
}

export async function markContactAsUnread(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactSubmissions).set({ isRead: 0 }).where(eq(contactSubmissions.id, id));
}

export async function deleteContactSubmission(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
}

export async function getRagKnowledgeBase() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ragKnowledgeBase).orderBy(desc(ragKnowledgeBase.createdAt));
}

export async function createRagChunk(data: InsertRagKnowledgeBase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(ragKnowledgeBase).values(data);
}

export async function deleteRagChunk(chunkId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(ragKnowledgeBase).where(eq(ragKnowledgeBase.chunkId, chunkId));
}

export async function createChatLog(data: InsertChatLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(chatLogs).values(data);
}

export async function getChatLogs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatLogs).orderBy(desc(chatLogs.createdAt));
}

export async function createResumeAnalyzerLog(data: InsertResumeAnalyzerLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(resumeAnalyzerLogs).values(data);
}
