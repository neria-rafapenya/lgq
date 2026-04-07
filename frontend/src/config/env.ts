export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080";

export const BUILD_TARGET =
  (import.meta.env.VITE_BUILD_TARGET as "app" | "widget" | undefined) || "app";
