import { describe, expect, it } from "vitest";
import {
  analyzeJobDescription,
  blogPostValues,
  fallbackRagAnswer,
  slugify,
} from "./portfolioLogic";

const baseBlogPost = {
  title: "Building Secure React Apps",
  slug: "Building Secure React Apps!",
  excerpt: "A practical note about building safer React applications.",
  content: "Long enough blog content for a useful technical article.",
  coverImageUrl: "",
  tags: ["React", "Security"],
  isPublished: 1,
  publishedAt: "2026-06-07T12:00:00.000Z",
  order: 2,
};

describe("portfolio logic", () => {
  it("normalizes slugs for URLs", () => {
    expect(slugify("  React + Django: A Secure API!  ")).toBe("react-django-a-secure-api");
  });

  it("normalizes blog post values for persistence", () => {
    const values = blogPostValues(baseBlogPost);

    expect(values).toMatchObject({
      title: baseBlogPost.title,
      slug: "building-secure-react-apps",
      coverImageUrl: null,
      tags: JSON.stringify(["React", "Security"]),
      isPublished: 1,
      order: 2,
    });
    expect(values.publishedAt).toBeInstanceOf(Date);
  });

  it("rejects invalid blog published dates", () => {
    expect(() => blogPostValues({ ...baseBlogPost, publishedAt: "not-a-date" })).toThrow("Published date is invalid.");
  });

  it("returns contact fallback answers from visitor wording", () => {
    const answer = fallbackRagAnswer("How can I email you?", "unused context");

    expect(answer).toContain("lidetadmassu217@outlook.com");
    expect(answer).toContain("+251-931460438");
  });

  it("scores job descriptions against listed technical strengths", () => {
    const result = analyzeJobDescription(
      "We need a junior React TypeScript Django REST API frontend backend engineer with AI experience."
    );

    expect(result.matchScore).toBeGreaterThanOrEqual(70);
    expect(result.matchedKeywords).toEqual(expect.arrayContaining(["react", "typescript", "django", "api", "ai"]));
    expect(result.pitch).toContain("full-stack engineer");
  });

  it("surfaces requested but unlisted skill gaps", () => {
    const result = analyzeJobDescription("We need Kubernetes and GraphQL experience for a platform role.");

    expect(result.skillGaps).toEqual(expect.arrayContaining(["kubernetes", "graphql"]));
  });
});
