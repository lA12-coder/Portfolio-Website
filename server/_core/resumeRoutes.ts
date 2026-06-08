import type { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";

import { getLatestResumeAsset } from "../db";

const fallbackResumeFileName = "lidet-admassu-resume.pdf";

function fallbackResumePath() {
  const candidates = [
    path.resolve(import.meta.dirname, "..", "..", "client", "public", "documents", fallbackResumeFileName),
    path.resolve(import.meta.dirname, "public", "documents", fallbackResumeFileName),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function sendPdfBuffer(res: Response, buffer: Buffer, fileName: string) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", String(buffer.length));
  res.setHeader("Content-Disposition", `inline; filename="${fileName.replace(/"/g, "")}"`);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.end(buffer);
}

export function registerResumeRoutes(app: Express) {
  app.get("/api/resume/pdf", async (_req: Request, res: Response) => {
    try {
      const asset = await getLatestResumeAsset();

      if (asset) {
        const [, base64] = asset.dataUrl.split(",");
        sendPdfBuffer(res, Buffer.from(base64, "base64"), asset.fileName);
        return;
      }

      const fallbackPath = fallbackResumePath();

      if (!fallbackPath) {
        res.status(404).json({ error: "Resume PDF not found." });
        return;
      }

      sendPdfBuffer(res, await fs.promises.readFile(fallbackPath), fallbackResumeFileName);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Resume PDF failed to load.";
      res.status(500).json({ error: message });
    }
  });
}
