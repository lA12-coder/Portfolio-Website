import { TRPCError } from "@trpc/server";
import nodemailer from "nodemailer";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
  replyTo?: string;
};

export type NewsletterPostPayload = {
  title: string;
  excerpt: string;
  slug: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const buildEndpointUrl = (baseUrl: string): string => {
  const normalizedBase = baseUrl.endsWith("/")
    ? baseUrl
    : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content, replyTo: input.replyTo };
};

async function sendOwnerEmail(payload: NotificationPayload): Promise<boolean> {
  if (!ENV.smtpHost || !ENV.smtpUser || !ENV.smtpPassword || !ENV.contactEmailTo) {
    console.warn("[Email] SMTP email delivery is not configured.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure,
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: ENV.emailFrom || ENV.smtpUser,
      to: ENV.contactEmailTo,
      replyTo: payload.replyTo,
      subject: payload.title,
      text: payload.content,
      html: payload.content
        .split("\n")
        .map((line) => `<p>${line.replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char] ?? char))}</p>`)
        .join(""),
    });

    return true;
  } catch (error) {
    console.warn("[Email] Failed to send owner email:", error);
    return false;
  }
}

export async function notifyNewsletterSubscribers(
  subscribers: Array<{ email: string }>,
  post: NewsletterPostPayload
): Promise<boolean> {
  const emails = Array.from(
    new Set(
      subscribers
        .map((subscriber) => subscriber.email.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (emails.length === 0) {
    return true;
  }

  if (!ENV.smtpHost || !ENV.smtpUser || !ENV.smtpPassword) {
    console.warn("[Newsletter] SMTP email delivery is not configured.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpSecure,
    auth: {
      user: ENV.smtpUser,
      pass: ENV.smtpPassword,
    },
  });

  const baseUrl = ENV.siteUrl.replace(/\/$/, "");
  const postUrl = baseUrl ? `${baseUrl}/blog/${post.slug}` : `/blog/${post.slug}`;
  const escapedTitle = post.title.replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char] ?? char));
  const escapedExcerpt = post.excerpt.replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[char] ?? char));

  try {
    await transporter.sendMail({
      from: ENV.emailFrom || ENV.smtpUser,
      to: ENV.emailFrom || ENV.smtpUser,
      bcc: emails,
      subject: `New blog post: ${post.title}`,
      text: `A new blog post is live: ${post.title}\n\n${post.excerpt}\n\nRead it here: ${postUrl}`,
      html: [
        `<p>A new blog post is live:</p>`,
        `<h2>${escapedTitle}</h2>`,
        `<p>${escapedExcerpt}</p>`,
        `<p><a href="${postUrl}">Read the article</a></p>`,
      ].join(""),
    });

    return true;
  } catch (error) {
    console.warn("[Newsletter] Failed to notify subscribers:", error);
    return false;
  }
}

/**
 * Dispatches a project-owner notification through the Manus Notification Service.
 * Returns `true` if the request was accepted, `false` when the upstream service
 * cannot be reached (callers can fall back to email/slack). Validation errors
 * bubble up as TRPC errors so callers can fix the payload.
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content, replyTo } = validatePayload(payload);

  const emailDelivered = await sendOwnerEmail({ title, content, replyTo });

  if (!ENV.forgeApiUrl) {
    console.warn("[Notification] Notification service URL is not configured.");
    return emailDelivered;
  }

  if (!ENV.forgeApiKey) {
    console.warn("[Notification] Notification service API key is not configured.");
    return emailDelivered;
  }

  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return emailDelivered;
  }
}
