import type { Express, Request, Response } from "express";
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { sdk } from "./sdk";

const uploadRoot = path.resolve(import.meta.dirname, "../..", "uploads");
const projectUploadDir = path.join(uploadRoot, "projects");
const maxImageBytes = 5 * 1024 * 1024;

const allowedMimeTypes: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/webp": "webp",
};

type ImageUploadBody = {
  fileName?: string;
  dataUrl?: string;
};

function parseDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:avif|gif|jpeg|png|svg\+xml|webp));base64,([a-z0-9+/=\s]+)$/i.exec(dataUrl);

  if (!match) {
    throw new Error("Upload must be a base64 encoded image data URL.");
  }

  const [, mimeType, base64] = match;
  const extension = allowedMimeTypes[mimeType.toLowerCase()];

  if (!extension) {
    throw new Error("Unsupported image type.");
  }

  const buffer = Buffer.from(base64.replace(/\s/g, ""), "base64");

  if (buffer.length === 0) {
    throw new Error("Uploaded image is empty.");
  }

  if (buffer.length > maxImageBytes) {
    throw new Error("Image must be 5MB or smaller.");
  }

  return { buffer, extension };
}

export function registerProjectUploads(app: Express) {
  fs.mkdirSync(projectUploadDir, { recursive: true });

  app.use("/uploads", express.static(uploadRoot));

  app.post("/api/admin/project-image", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);

      if (user.role !== "admin") {
        res.status(403).json({ error: "Admin access required." });
        return;
      }

      const body = req.body as ImageUploadBody;

      if (!body.dataUrl) {
        res.status(400).json({ error: "No image was provided." });
        return;
      }

      const { buffer, extension } = parseDataUrl(body.dataUrl);
      const safeBaseName = (body.fileName || "project-image")
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9-_]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48) || "project-image";
      const fileName = `${safeBaseName}-${nanoid(10)}.${extension}`;
      const filePath = path.join(projectUploadDir, fileName);

      await fs.promises.writeFile(filePath, buffer);

      res.json({
        url: `/uploads/projects/${fileName}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";
      res.status(400).json({ error: message });
    }
  });
}
