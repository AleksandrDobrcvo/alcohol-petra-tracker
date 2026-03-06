import { createHash, randomBytes } from "crypto";

export function generatePublicToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPublicToken(rawToken: string): string {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

