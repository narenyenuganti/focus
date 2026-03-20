import {
  createSessionToken,
  isPasswordValid,
  isSessionTokenValid,
} from "@/lib/auth/session";

test("accepts the configured tracker password", () => {
  process.env.APP_PASSWORD = "secret";

  expect(isPasswordValid("secret")).toBe(true);
  expect(isPasswordValid("wrong")).toBe(false);
});

test("creates a verifiable session token from the configured password", () => {
  process.env.APP_PASSWORD = "secret";

  const token = createSessionToken();

  expect(isSessionTokenValid(token)).toBe(true);
  expect(isSessionTokenValid("invalid")).toBe(false);
});
