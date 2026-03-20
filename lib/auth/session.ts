import { createHash, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "tracker_session";

function getConfiguredPassword() {
  return process.env.APP_PASSWORD ?? "tracker";
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isPasswordValid(candidate: string) {
  return safeEquals(digest(candidate), digest(getConfiguredPassword()));
}

export function createSessionToken() {
  return digest(`tracker-session:${getConfiguredPassword()}`);
}

export function isSessionTokenValid(token: string | undefined) {
  if (!token) {
    return false;
  }

  return safeEquals(token, createSessionToken());
}
