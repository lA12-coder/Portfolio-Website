# Implementation Guides for Portfolio Features

This document provides step-by-step implementation guides for complex features that require detailed technical setup.

---

## 1. RAG Chat Assistant Implementation Guide

### Overview

The RAG (Retrieval-Augmented Generation) Chat Assistant allows visitors to ask questions about Lidet's background, skills, and projects. The system retrieves relevant information from a knowledge base and uses an LLM to generate contextual responses.

### Architecture

```
User Question
    ↓
Embedding Generation
    ↓
Vector Search (Cosine Similarity)
    ↓
Retrieve Top 3-5 Chunks
    ↓
Construct LLM Prompt with Context
    ↓
Stream LLM Response
    ↓
Log Interaction
    ↓
Display to User
```

### Step 1: Set Up Knowledge Base Table

The `ragKnowledgeBase` table stores resume chunks with embeddings:

```typescript
// In drizzle/schema.ts
export const ragKnowledgeBase = mysqlTable('ragKnowledgeBase', {
  id: int('id').autoincrement().primaryKey(),
  chunkId: varchar('chunkId', { length: 64 }).notNull().unique(),
  content: text('content').notNull(),
  tokens: int('tokens').default(0),
  embedding: json('embedding'), // Vector stored as JSON array
  metadata: json('metadata'), // Optional: source, page, etc.
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
```

### Step 2: Create Chat Logs Table

```typescript
// In drizzle/schema.ts
export const chatLogs = mysqlTable('chatLogs', {
  id: int('id').autoincrement().primaryKey(),
  visitorId: varchar('visitorId', { length: 64 }).notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  retrievedChunks: json('retrievedChunks'), // IDs of chunks used
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
```

### Step 3: Implement Backend Procedures

```typescript
// In server/routers.ts
rag: router({
  chat: publicProcedure
    .input(z.object({
      question: z.string().min(1).max(1000),
      visitorId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // 1. Generate embedding for question
      const questionEmbedding = await generateEmbedding(input.question);

      // 2. Search knowledge base
      const chunks = await searchKnowledgeBase(questionEmbedding, 5);

      // 3. Construct context
      const context = chunks
        .map((c) => c.content)
        .join('\n\n---\n\n');

      // 4. Call LLM
      const response = await invokeLLM({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant representing Lidet Admassu, a software engineer and AI specialist. Answer questions about Lidet's background, skills, projects, and experience based on the provided context. Be helpful, professional, and accurate. If you don't know something, say so.`,
          },
          {
            role: 'user',
            content: `Context about Lidet:\n${context}\n\nQuestion: ${input.question}`,
          },
        ],
      });

      // 5. Log interaction
      await db.insert(chatLogs).values({
        visitorId: input.visitorId,
        question: input.question,
        answer: response.choices[0].message.content,
        retrievedChunks: chunks.map((c) => c.chunkId),
      });

      return {
        answer: response.choices[0].message.content,
        sources: chunks.map((c) => c.metadata),
      };
    }),
}),
```

### Step 4: Implement Vector Search

```typescript
// In server/db.ts
export async function searchKnowledgeBase(
  queryEmbedding: number[],
  limit: number = 5
) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Fetch all chunks with embeddings
  const chunks = await db
    .select()
    .from(ragKnowledgeBase)
    .where(isNotNull(ragKnowledgeBase.embedding));

  // Calculate cosine similarity
  const scored = chunks
    .map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(
        queryEmbedding,
        chunk.embedding as number[]
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

### Step 5: Frontend Chat Component

```typescript
// In client/src/components/RagChatAssistant.tsx
import React, { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { Streamdown } from 'streamdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function RagChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [visitorId] = useState(() => 
    localStorage.getItem('visitorId') || crypto.randomUUID()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.rag.chat.useMutation();

  useEffect(() => {
    localStorage.setItem('visitorId', visitorId);
  }, [visitorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = input;
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    try {
      // Get assistant response
      const response = await chatMutation.mutateAsync({
        question: userMessage,
        visitorId,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-96 rounded-lg border border-white/10 bg-white/5">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                Ask me anything about Lidet
              </p>
              <p className="text-sm text-muted-foreground">
                I can help with questions about skills, projects, and experience.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-white/10 text-foreground'
              }`}
            >
              {msg.role === 'assistant' ? (
                <Streamdown>{msg.content}</Streamdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={chatMutation.isPending}
            className="bg-white/5 border-white/10"
          />
          <Button
            type="submit"
            disabled={chatMutation.isPending || !input.trim()}
            className="bg-accent hover:bg-accent/90"
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
```

### Step 6: Initialize Knowledge Base

To populate the knowledge base with Lidet's resume:

1. Create a resume chunk file with sections (About, Experience, Skills, Projects)
2. Upload via admin panel
3. System automatically chunks and generates embeddings
4. Embeddings stored in database

---

## 2. AI Resume Analyzer Implementation Guide

### Overview

The AI Resume Analyzer allows recruiters to paste job descriptions and receive a match analysis against Lidet's resume.

### Backend Implementation

```typescript
// In server/routers.ts
resumeAnalyzer: router({
  analyze: publicProcedure
    .input(z.object({
      jobDescription: z.string().min(100),
      visitorId: z.string(),
    }))
    .mutation(async ({ input }) => {
      // 1. Extract skills from job description
      const extractSkillsResponse = await invokeLLM({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract all technical skills and requirements from the job description. Return as JSON array.',
          },
          {
            role: 'user',
            content: input.jobDescription,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'skills_extraction',
            schema: {
              type: 'object',
              properties: {
                skills: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      });

      const requiredSkills = JSON.parse(
        extractSkillsResponse.choices[0].message.content
      ).skills;

      // 2. Get Lidet's resume
      const lidetResume = await getDb()
        .select()
        .from(ragKnowledgeBase)
        .where(eq(ragKnowledgeBase.metadata, { type: 'resume' }));

      const resumeContent = lidetResume
        .map((chunk) => chunk.content)
        .join('\n');

      // 3. Analyze match
      const analysisResponse = await invokeLLM({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze how well the candidate matches the job requirements.',
          },
          {
            role: 'user',
            content: `Required Skills: ${requiredSkills.join(', ')}\n\nCandidate Resume:\n${resumeContent}`,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'match_analysis',
            schema: {
              type: 'object',
              properties: {
                matchScore: { type: 'number', minimum: 0, maximum: 100 },
                matchedKeywords: { type: 'array', items: { type: 'string' } },
                skillGaps: { type: 'array', items: { type: 'string' } },
                pitch: { type: 'string' },
              },
            },
          },
        },
      });

      const analysis = JSON.parse(
        analysisResponse.choices[0].message.content
      );

      // 4. Log analysis
      await db.insert(resumeAnalyzerLogs).values({
        visitorId: input.visitorId,
        jobDescription: input.jobDescription,
        matchScore: analysis.matchScore,
        analysis: JSON.stringify(analysis),
      });

      return analysis;
    }),
}),
```

### Frontend Implementation

```typescript
// In client/src/components/ResumeAnalyzer.tsx
import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function ResumeAnalyzer() {
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [visitorId] = useState(() => crypto.randomUUID());

  const analyzeMutation = trpc.resumeAnalyzer.analyze.useMutation();

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }

    try {
      const result = await analyzeMutation.mutateAsync({
        jobDescription,
        visitorId,
      });
      setAnalysis(result);
    } catch (error) {
      toast.error('Failed to analyze job description');
    }
  };

  return (
    <div className="space-y-6">
      {!analysis ? (
        <div className="space-y-4">
          <Textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-48"
          />
          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
            className="w-full"
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2" />
                Analyze Job Description
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Match Score */}
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Match Score</h3>
              <span className="text-3xl font-bold text-accent">
                {analysis.matchScore}%
              </span>
            </div>
            <Progress value={analysis.matchScore} className="h-2" />
          </div>

          {/* Matched Keywords */}
          <div>
            <h3 className="font-bold mb-3">Matched Skills</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedKeywords.map((keyword: string) => (
                <span
                  key={keyword}
                  className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                >
                  ✓ {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          <div>
            <h3 className="font-bold mb-3">Skills to Develop</h3>
            <div className="flex flex-wrap gap-2">
              {analysis.skillGaps.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm"
                >
                  ◯ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Pitch */}
          <div className="p-6 rounded-lg bg-white/5 border border-white/10">
            <h3 className="font-bold mb-3">Your Pitch</h3>
            <p className="text-muted-foreground leading-relaxed">
              {analysis.pitch}
            </p>
          </div>

          <Button
            onClick={() => {
              setAnalysis(null);
              setJobDescription('');
            }}
            variant="outline"
            className="w-full"
          >
            Analyze Another Job
          </Button>
        </div>
      )}
    </div>
  );
}
```

---

## 3. Weather Widget Implementation Guide

### Backend Setup

```typescript
// In server/routers.ts
weather: router({
  getCurrent: publicProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
    }))
    .query(async ({ input }) => {
      const apiKey = process.env.OPENWEATHER_API_KEY;
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${input.latitude}&lon=${input.longitude}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather');
      }

      const data = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        location: data.name,
      };
    }),
}),
```

### Frontend Implementation

```typescript
// In client/src/components/WeatherWidget.tsx
import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';

export default function WeatherWidget() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<any>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Fallback to IP-based geolocation
          console.log('Geolocation permission denied');
        }
      );
    }
  }, []);

  // Fetch weather
  const weatherQuery = trpc.weather.getCurrent.useQuery(
    location || { latitude: 0, longitude: 0 },
    { enabled: !!location }
  );

  useEffect(() => {
    if (weatherQuery.data) {
      setWeather(weatherQuery.data);
    }
  }, [weatherQuery.data]);

  if (!weather) {
    return null;
  }

  const getWeatherIcon = () => {
    if (weather.condition.includes('Rain')) return <CloudRain size={24} />;
    if (weather.condition.includes('Cloud')) return <Cloud size={24} />;
    return <Sun size={24} />;
  };

  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">{weather.location}</p>
          <p className="text-2xl font-bold text-foreground">
            {weather.temperature}°C
          </p>
        </div>
        <div className="text-accent">{getWeatherIcon()}</div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{weather.condition}</p>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Droplets size={14} />
          {weather.humidity}%
        </div>
        <div className="flex items-center gap-1">
          <Wind size={14} />
          {weather.windSpeed} m/s
        </div>
      </div>
    </div>
  );
}
```

---

## 4. 3D WebGL Mesh Implementation Guide

### Setup React Three Fiber

```bash
npm install three @react-three/fiber @react-three/drei
```

### Create 3D Mesh Component

```typescript
// In client/src/components/ThreeMesh.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Icosahedron, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function MeshContent() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [mouseVelocity, setMouseVelocity] = useState(0);
  const [scrollAccel, setScrollAccel] = useState(0);

  // Track mouse movement
  useEffect(() => {
    let lastX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const velocity = Math.abs(e.clientX - lastX);
      setMouseVelocity(Math.min(velocity / 100, 1));
      lastX = e.clientX;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track scroll
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const scrollDelta = Math.abs(window.scrollY - lastScroll);
      setScrollAccel(Math.min(scrollDelta / 1000, 1));
      lastScroll = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate mesh
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      materialRef.current.uniforms.uCursorVelocity.value = mouseVelocity;
      materialRef.current.uniforms.uScrollAccel.value = scrollAccel;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 6]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uCursorVelocity: { value: 0 },
          uScrollAccel: { value: 0 },
          uColor: { value: new THREE.Color(0xfb923c) },
        }}
      />
    </mesh>
  );
}

const vertexShader = `
  uniform float uTime;
  uniform float uCursorVelocity;
  uniform float uScrollAccel;

  varying float vNoise;

  float snoise(vec3 v) {
    // Simplex noise implementation
    return sin(v.x * 10.0 + uTime) * 0.5 + 0.5;
  }

  void main() {
    float noise = snoise(position * 2.0 + uTime * 0.5);
    float distortion = noise * (0.5 + uCursorVelocity * 0.5 + uScrollAccel * 0.3);
    
    vec3 newPosition = position + normal * distortion;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    
    vNoise = noise;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vNoise;

  void main() {
    vec3 color = mix(uColor * 0.5, uColor, vNoise);
    gl_FragColor = vec4(color, 0.9);
  }
`;

export default function ThreeMesh() {
  return (
    <Canvas className="w-full h-full" camera={{ position: [0, 0, 2.5] }}>
      <MeshContent />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </Canvas>
  );
}
```

---

## 5. Testing Strategy

### Unit Tests with Vitest

```typescript
// In server/routers.test.ts
import { describe, it, expect, vi } from 'vitest';
import { appRouter } from './routers';

describe('RAG Chat', () => {
  it('should return a response for a valid question', async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: 'user' },
    });

    const result = await caller.rag.chat({
      question: 'What are your skills?',
      visitorId: 'test-visitor',
    });

    expect(result).toHaveProperty('answer');
    expect(result.answer).toBeTruthy();
  });
});

describe('Resume Analyzer', () => {
  it('should analyze a job description', async () => {
    const caller = appRouter.createCaller({
      user: null,
    });

    const result = await caller.resumeAnalyzer.analyze({
      jobDescription: 'We need a React developer with 5+ years experience...',
      visitorId: 'test-visitor',
    });

    expect(result).toHaveProperty('matchScore');
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.matchScore).toBeLessThanOrEqual(100);
  });
});
```

---

## 6. Deployment Checklist

- [ ] All environment variables configured (API keys, database URL)
- [ ] Database migrations applied
- [ ] Knowledge base populated with resume content
- [ ] Admin user role set in database
- [ ] SSL/HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] SEO metadata added
- [ ] Analytics integrated

---

## 7. Future Enhancements

1. **Multi-language Support** - Translate portfolio to Amharic, Oromo
2. **Real-time Notifications** - WebSocket for admin notifications
3. **Advanced Analytics** - Track visitor behavior and engagement
4. **Email Integration** - Send contact form submissions via email
5. **Blog Section** - Add technical blog with MDX support
6. **Video Testimonials** - Support for video reviews
7. **Project Showcase** - Interactive 3D project gallery
8. **Skill Assessment Quiz** - Test visitor knowledge of Lidet's skills
