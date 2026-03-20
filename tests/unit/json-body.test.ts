import { z } from "zod";
import { expect, test } from "vitest";
import { parseJsonBody } from "@/lib/server/json-body";

test("returns a 400 response for malformed json bodies", async () => {
  const request = new Request("http://localhost/api/test", {
    method: "POST",
    body: "",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await parseJsonBody(
    request,
    z.object({
      hours: z.number(),
    }),
  );

  expect(result.ok).toBe(false);

  if (result.ok) {
    throw new Error("Expected invalid JSON parsing to fail.");
  }

  expect(result.response.status).toBe(400);
  await expect(result.response.json()).resolves.toEqual({
    error: "Invalid JSON body",
  });
});

test("returns parsed data for valid json bodies", async () => {
  const request = new Request("http://localhost/api/test", {
    method: "POST",
    body: JSON.stringify({ hours: 8 }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result = await parseJsonBody(
    request,
    z.object({
      hours: z.number(),
    }),
  );

  expect(result).toEqual({
    ok: true,
    data: {
      hours: 8,
    },
  });
});
