import { ConvexReactClient } from "convex/react";

function getConvexUrl(): string {
  const envUrl =
    (import.meta.env.VITE_CONVEX_URL as string | undefined) ||
    (typeof process !== "undefined"
      ? process.env?.VITE_CONVEX_URL || process.env?.CONVEX_URL
      : undefined);

  if (envUrl && typeof envUrl === "string" && envUrl.trim().startsWith("http")) {
    return envUrl.trim();
  }

  return "https://placeholder.convex.cloud";
}

const url = getConvexUrl();

if (url === "https://placeholder.convex.cloud") {
  console.warn(
    "VITE_CONVEX_URL is not set or invalid — falling back to placeholder Convex URL.",
  );
}

export const convex = new ConvexReactClient(url);

