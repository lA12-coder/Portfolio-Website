const normalizedApiBase = () => {
  const value = import.meta.env.VITE_API_URL?.trim();
  return value ? value.replace(/\/$/, "") : "";
};

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedApiBase()}${normalizedPath}`;
};

export const assetUrl = (path: string | null | undefined) => {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return apiUrl(path);
};
