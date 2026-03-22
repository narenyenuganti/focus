import { act, fireEvent, render, screen } from "@testing-library/react";
import { SyncButton, MIN_SYNC_NOTICE_MS } from "@/components/sync-button";

function createResponse(payload: unknown) {
  return {
    ok: true,
    json: async () => payload,
  } as Response;
}

const metadata = {
  pendingFiles: [],
  pendingCount: 0,
  recentCommits: [],
  lastSyncedAt: null,
  lastSyncedCommit: null,
};

test("keeps the syncing notice visible before showing a noop result", async () => {
  vi.useFakeTimers();

  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(createResponse({ ok: true, metadata }))
    .mockResolvedValueOnce(
      createResponse({
        ok: true,
        kind: "noop",
        message: "Nothing to sync.",
      }),
    )
    .mockResolvedValueOnce(createResponse({ ok: true, metadata }));

  vi.stubGlobal("fetch", fetchMock);

  render(<SyncButton />);

  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);

  fireEvent.click(screen.getByRole("button", { name: "Sync tracker data" }));
  await act(async () => {
    await Promise.resolve();
  });

  expect(screen.getByRole("heading", { name: "Syncing tracker data" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Already synced" })).not.toBeInTheDocument();

  await act(async () => {
    vi.advanceTimersByTime(MIN_SYNC_NOTICE_MS - 1);
    await Promise.resolve();
  });
  expect(screen.getByRole("heading", { name: "Syncing tracker data" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Already synced" })).not.toBeInTheDocument();

  await act(async () => {
    vi.advanceTimersByTime(1);
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(screen.getByRole("heading", { name: "Already synced" })).toBeInTheDocument();

  vi.unstubAllGlobals();
  vi.useRealTimers();
});
