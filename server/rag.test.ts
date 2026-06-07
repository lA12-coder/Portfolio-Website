import { describe, expect, it } from "vitest";
import {
  chunkText,
  cosineSimilarity,
  generateChunkId,
  searchTextChunks,
} from "./rag";

describe("RAG helpers", () => {
  it("chunks text into non-empty bounded sections", () => {
    const chunks = chunkText(
      "React powers the interface. Django serves the API. RAG improves portfolio search.",
      40
    );

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length > 0)).toBe(true);
  });

  it("ranks text chunks by keyword overlap", () => {
    const results = searchTextChunks("React API", [
      { content: "React and API work with TypeScript." },
      { content: "A design-only case study." },
      { content: "API API API performance notes." },
    ]);

    expect(results[0].content).toContain("API API API");
    expect(results.every((result) => result.similarity > 0)).toBe(true);
  });

  it("calculates cosine similarity for vectors", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(() => cosineSimilarity([1], [1, 0])).toThrow("Vectors must have the same length");
  });

  it("generates stable chunk IDs", () => {
    expect(generateChunkId(3, 123456)).toBe("chunk_123456_3");
  });
});
