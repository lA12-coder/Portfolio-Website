import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
  email?: string | null;
};

type GoogleTokenResponse = {
  access_token: string;
  expires_in?: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
};

type GoogleUserInfo = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

class SDKServer {
  private decodeState(state: string): string {
    return atob(state);
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }
    return new TextEncoder().encode(secret);
  }

  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<GoogleTokenResponse> {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      throw new Error("Google OAuth client id/secret are not configured");
    }

    const body = new URLSearchParams({
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: this.decodeState(state),
      grant_type: "authorization_code",
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Google token exchange failed: ${response.status} ${detail}`);
    }

    return (await response.json()) as GoogleTokenResponse;
  }

  async getUserInfo(accessToken: string): Promise<GoogleUserInfo & { openId: string; loginMethod: string }> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Google userinfo failed: ${response.status} ${detail}`);
    }

    const data = (await response.json()) as GoogleUserInfo;

    return {
      ...data,
      openId: data.sub,
      loginMethod: "google",
    };
  }

  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string; email?: string | null } = {}
  ): Promise<string> {
    return this.signSession(
      {
        openId,
        appId: ENV.googleClientId,
        name: options.name || "",
        email: options.email ?? null,
      },
      options
    );
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
      email: payload.email ?? null,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string; email?: string | null } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name, email } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        openId,
        appId,
        name,
        email: typeof email === "string" ? email : null,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<AuthenticatedUser> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const signedInAt = new Date();
    let user = await db.getUserByOpenId(session.openId);

    if (!user) {
      await db.upsertUser({
        openId: session.openId,
        name: session.name || null,
        email: session.email ?? null,
        loginMethod: "google",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(session.openId);
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      email: user.email,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export type AuthenticatedUser = User;

export const sdk = new SDKServer();
