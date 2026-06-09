export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

import { apiUrl } from "@/lib/api";

export const RESUME_PDF_URL = "/documents/lidet-admassu-resume.pdf";

// Generate Google login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = apiUrl("/api/oauth/callback");
  const state = btoa(redirectUri);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");

  return url.toString();
};
