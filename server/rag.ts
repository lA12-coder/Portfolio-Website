import { getDb } from './db';
import { ragKnowledgeBase } from '../drizzle/schema';
import { isNotNull } from 'drizzle-orm';
import { ENV } from './_core/env';

export const LIDET_PROFILE_CONTEXT = `
LIDET ADMASSU - Software Engineer & AI Specialist

Professional summary:
Lidet is a dedicated software engineer based in Addis Ababa, Ethiopia, focused on elegant digital experiences, full-stack development, AI integration, backend systems, and thoughtful product design.

Technical skills:
- HTML/CSS: 95%
- JavaScript: 90%
- React: 90%
- TypeScript: 80%
- Django: 90%
- Node.js: 75%
- MySQL: 85%
- PostgreSQL: 80%
- Tailwind CSS, REST APIs, Git/GitHub, Docker, AWS, Next.js, Vite, LLM integration, prompt engineering, embeddings, semantic search, RAG systems, Python data analysis.

Work experience:
Fullstack Web Developer Intern at INSA, 2024-2025. Worked on Sirkuni, a secure government communications tool. Used React, Django, REST APIs, secure authentication and authorization, backend performance optimization, REST API documentation, and cross-functional system architecture work. Improved API response time by 40%.

Education:
- Bachelor of Science in Software Engineering, Adama Science and Technology University (ASTU), 2023-Present.
- BA in Economics, Arsi University, 2024-Present.

Certifications:
- Advanced Frontend Development - Udacity
- UI/UX Design Professional - Udemy
- React Developer Certification - Udemy
- Backend Development with Django - ALX
- Backend Web Development Graduate - ALX Africa
- Frontend Web Development - Coursera/Udemy

Projects:
- Beauty House: appointment management website for a beauty salon. React, TypeScript, Tailwind CSS, Django REST API.
- Fitness Website: modern gym/fitness business website. React.js, Tailwind CSS, Next.js.
- GeezGeeks: Ethiopian tech startup website. Next.js, Tailwind CSS, Node.js, PostgreSQL.
- Ecommerce API: e-commerce backend API. Django, Django REST Framework, MySQL, Swagger UI.

Contact:
Email: lidetadmassu217@outlook.com
Phone: +251-931460438
Location: Addis Ababa, Ethiopia
GitHub: https://github.com/lA12-coder
LinkedIn: https://www.linkedin.com/in/lidtech/
`;

function resolveEmbeddingUrl() {
  if (ENV.huggingFaceEmbeddingUrl.trim()) {
    return ENV.huggingFaceEmbeddingUrl.trim();
  }

  const model = encodeURIComponent(ENV.huggingFaceEmbeddingModel);
  return `https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number');
}

function meanPool(vectors: number[][]) {
  if (vectors.length === 0) {
    throw new Error('Embedding response did not include vectors');
  }

  const dimension = vectors[0].length;
  const pooled = new Array<number>(dimension).fill(0);

  for (const vector of vectors) {
    if (vector.length !== dimension) {
      throw new Error('Embedding response included inconsistent vector dimensions');
    }
    for (let index = 0; index < dimension; index += 1) {
      pooled[index] += vector[index];
    }
  }

  return pooled.map((value) => value / vectors.length);
}

function normalizeEmbeddingResponse(value: unknown): number[] {
  if (isNumberArray(value)) {
    return value;
  }

  if (Array.isArray(value) && value.every(isNumberArray)) {
    const vectors = value as number[][];
    return vectors.length === 1 ? vectors[0] : meanPool(vectors);
  }

  if (Array.isArray(value) && value.length === 1) {
    return normalizeEmbeddingResponse(value[0]);
  }

  throw new Error('Unexpected embedding response format');
}

/**
 * Generate embedding for text using Hugging Face feature extraction.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    if (!ENV.huggingFaceApiKey) {
      throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    const response = await fetch(resolveEmbeddingUrl(), {
      method: 'POST',
      headers: {
        authorization: `Bearer ${ENV.huggingFaceApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        normalize: true,
        truncate: true,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`Hugging Face embedding failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ''}`);
    }

    return normalizeEmbeddingResponse(await response.json());
  } catch (error) {
    console.error('[RAG] Failed to generate embedding:', error);
    throw error;
  }
}

export function searchTextChunks(query: string, chunks: Array<{ content: string }>, limit: number = 5) {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .filter((term) => term.length > 2);

  return chunks
    .map((chunk) => {
      const content = chunk.content.toLowerCase();
      const score = terms.reduce((sum, term) => {
        const matches = content.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
        return sum + (matches?.length ?? 0);
      }, 0);

      return { ...chunk, similarity: score };
    })
    .filter((chunk) => chunk.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Search knowledge base using vector similarity
 */
export async function searchKnowledgeBase(
  queryEmbedding: number[],
  limit: number = 5
) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Fetch all chunks with embeddings
    const chunks = await db
      .select()
      .from(ragKnowledgeBase)
      .where(isNotNull(ragKnowledgeBase.embedding));

    // Calculate similarity scores
    const scored = chunks
      .map((chunk) => {
        const embedding = JSON.parse(chunk.embedding || '[]') as number[];
        return {
          ...chunk,
          similarity: cosineSimilarity(queryEmbedding, embedding),
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scored;
  } catch (error) {
    console.error('[RAG] Failed to search knowledge base:', error);
    throw error;
  }
}

/**
 * Chunk text into smaller pieces for embedding
 */
export function chunkText(text: string, chunkSize: number = 500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if ((currentChunk + trimmed).length <= chunkSize) {
      currentChunk += ' ' + trimmed;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = trimmed;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Generate a unique chunk ID
 */
export function generateChunkId(index: number, timestamp: number): string {
  return `chunk_${timestamp}_${index}`;
}

/**
 * Initialize knowledge base with Lidet's resume
 */
export async function initializeKnowledgeBase() {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Check if knowledge base already has content
    const existing = await db.select().from(ragKnowledgeBase).limit(1);
    if (existing.length > 0) {
      console.log('[RAG] Knowledge base already initialized');
      return;
    }

    // Lidet's resume content
    const resumeContent = `
LIDET ADMASSU - Software Engineer & AI Specialist

PROFESSIONAL SUMMARY
I am a dedicated software engineer with a passion for creating beautiful, functional digital experiences. With expertise in modern frontend frameworks, backend systems, and AI integration, I strive to build applications that not only look exceptional but also provide outstanding user experiences. I'm deeply interested in artificial intelligence, machine learning, and how technology can solve real-world problems.

TECHNICAL SKILLS
Frontend Development:
- HTML/CSS: 95% - Advanced semantic HTML, modern CSS3, responsive design, accessibility
- JavaScript: 90% - ES6+, async/await, functional programming, DOM manipulation
- React: 90% - Hooks, Context API, performance optimization, component architecture
- TypeScript: 80% - Type safety, interfaces, generics, strict mode

Backend Development:
- Django: 90% - REST APIs, ORM, authentication, middleware, deployment
- Node.js: 75% - Express, async patterns, middleware, server optimization
- MySQL: 85% - Database design, optimization, complex queries
- PostgreSQL: 80% - Advanced features, JSON support, performance tuning

Tools & Technologies:
- Git & GitHub - Version control, collaboration, CI/CD
- Docker - Containerization, deployment, orchestration
- AWS - EC2, S3, Lambda, RDS
- Tailwind CSS - Utility-first CSS, responsive design
- Next.js - SSR, static generation, API routes
- Vite - Fast build tool, HMR, optimization

AI & Machine Learning:
- LLM Integration - Prompt engineering, API integration, streaming
- Vector Databases - Embeddings, semantic search, RAG systems
- Data Analysis - Python, pandas, NumPy, visualization

WORK EXPERIENCE

Fullstack Web Developer Intern - INSA (2024-2025)
Information Network Security Administration
- Developed and optimized the backend layer of Sirkuni, a secure government communications tool
- Worked with React, Django, REST APIs, and implemented complex features for enhanced security and performance
- Optimized backend performance, reducing API response time by 40%
- Implemented secure authentication and authorization systems
- Developed comprehensive REST API documentation
- Collaborated with cross-functional teams to improve system architecture

EDUCATION

Bachelor of Science in Software Engineering (2023-Present)
Adama Science and Technology University (ASTU)
- Comprehensive program focusing on software development, algorithms, data structures
- Engaged in various projects to apply theoretical knowledge in real-world scenarios
- GPA: 3.8/4.0

BA in Economics (2024-Present)
Arsi University
- Learning fundamental economic principles, financial analysis, business planning
- Developing analytical skills applicable to technology and business strategy

CERTIFICATIONS
- Advanced Frontend Development - Udacity
- UI/UX Design Professional - Udemy
- React Developer Certification - Udemy
- Backend Development with Django - ALX
- Backend Web Development Graduate - ALX Africa
- Frontend Web Development - Coursera (Udemy)

PROJECTS

Beauty House - Full-featured appointment management website
- Technologies: React, TypeScript, Tailwind CSS, Django REST API
- Full-featured appointment management system for beauty salon
- Real-time booking and customer management
- Admin dashboard for business operations
- Responsive design for mobile and desktop

Fitness Website - Modern gym and fitness business website
- Technologies: React.js, Tailwind CSS, Next.js
- Engaging content showcasing fitness services
- Class schedules and trainer profiles
- Member testimonials and success stories
- Mobile-responsive design

GeezGeeks - Professional website for Ethiopian tech startup
- Technologies: Next.js, Tailwind CSS, Node.js, PostgreSQL
- Professional brand presence for tech startup
- Service showcase and portfolio
- Blog section with technical articles
- Integration with social media

Ecommerce API - Comprehensive e-commerce backend
- Technologies: Django, Django REST Framework, MySQL, Swagger UI
- Complete product management system
- Order processing and fulfillment
- User authentication and authorization
- Comprehensive API documentation
- Admin dashboard for business management

ABOUT ME
I'm passionate about building elegant solutions that solve real problems. I believe in writing clean, maintainable code and creating intuitive user experiences. I'm constantly learning new technologies and best practices to stay at the forefront of web development and AI integration.

When I'm not coding, I enjoy exploring new technologies, contributing to open-source projects, and sharing knowledge with the developer community. I'm based in Addis Ababa, Ethiopia, and available for freelance projects and full-time opportunities.

CONTACT INFORMATION
Email: lidetadmassu217@outlook.com
Phone: +251-931460438
Location: Addis Ababa, Ethiopia
GitHub: https://github.com/lA12-coder
LinkedIn: https://www.linkedin.com/in/lidtech/
    `;

    // Chunk the content
    const chunks = chunkText(resumeContent, 500);
    const timestamp = Date.now();

    // Generate embeddings and save chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = generateChunkId(i, timestamp);

      try {
        const embedding = await generateEmbedding(chunk);

        await db.insert(ragKnowledgeBase).values({
          chunkId,
          content: chunk,
          embedding: JSON.stringify(embedding),
          metadata: JSON.stringify({
            type: 'resume',
            chunkIndex: i,
            totalChunks: chunks.length,
          }),
        });

        console.log(`[RAG] Saved chunk ${i + 1}/${chunks.length}`);
      } catch (error) {
        console.error(`[RAG] Failed to process chunk ${i}:`, error);
      }
    }

    console.log('[RAG] Knowledge base initialized successfully');
  } catch (error) {
    console.error('[RAG] Failed to initialize knowledge base:', error);
  }
}
