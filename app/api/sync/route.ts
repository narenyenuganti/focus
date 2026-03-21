import { NextResponse } from "next/server";
import { createGitSyncMetadata, runGitSync } from "@/lib/server/git-sync";

export async function GET() {
  const metadata = await createGitSyncMetadata();

  return NextResponse.json(
    {
      ok: true,
      metadata,
    },
    { status: 200 },
  );
}

export async function POST() {
  const result = await runGitSync();

  if (result.kind === "noop") {
    return NextResponse.json(
      {
        ok: true,
        kind: result.kind,
        message: result.message,
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      kind: result.kind,
      files: result.files,
      commitMessage: result.commitMessage,
    },
    { status: 200 },
  );
}
