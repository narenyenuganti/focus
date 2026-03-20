import { NextResponse } from "next/server";
import type { ZodTypeAny } from "zod";

export async function parseJsonBody<TSchema extends ZodTypeAny>(
  request: Request,
  schema: TSchema,
) {
  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(rawBody);

  if (!result.success) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Invalid request body",
          issues: result.error.flatten(),
        },
        { status: 400 },
      ),
    };
  }

  return {
    ok: true as const,
    data: result.data,
  };
}
