"use client";

import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { SyncHistoryPanel } from "@/components/sync-history-panel";
import type { GitSyncMetadata } from "@/lib/server/git-sync";

async function fetchSyncMetadata() {
  const response = await fetch("/api/sync");
  const payload = (await response.json()) as {
    ok?: boolean;
    metadata?: GitSyncMetadata;
    error?: string;
  };

  if (!response.ok || !payload.ok || !payload.metadata) {
    return {
      ok: false as const,
      error: payload.error ?? "Could not load sync history.",
    };
  }

  return {
    ok: true as const,
    metadata: payload.metadata,
  };
}

export function SyncButton() {
  const [status, setStatus] = useState("Manual sync");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [metadata, setMetadata] = useState<GitSyncMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sync() {
    setStatus("Syncing tracker data...");

    const response = await fetch("/api/sync", {
      method: "POST",
    });
    const payload = (await response.json()) as { message?: string };

    setStatus(payload.message ?? "Sync complete");
    const result = await fetchSyncMetadata();

    if (result.ok) {
      setMetadata(result.metadata);
      setError(null);
      setHistoryOpen(true);
    } else {
      setError(result.error);
    }
  }

  useEffect(() => {
    void (async () => {
      const result = await fetchSyncMetadata();

      if (result.ok) {
        setMetadata(result.metadata);
        setError(null);
      } else {
        setError(result.error);
      }
    })();
  }, []);

  return (
    <div className="sync-button" style={{ position: "relative" }}>
      <button type="button" className="utility-button" onClick={() => void sync()}>
        <RefreshCcw size={16} />
        <span>Sync</span>
      </button>
      <p>{status}</p>
      <button
        type="button"
        className="ghost-button"
        onClick={() => setHistoryOpen((current) => !current)}
      >
        {historyOpen ? "Hide history" : "View history"}
      </button>
      {historyOpen ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: "calc(100% + 12px)",
            width: "min(360px, calc(100vw - 32px))",
            zIndex: 30,
          }}
        >
          <SyncHistoryPanel
            metadata={metadata}
            loading={!metadata && !error}
            error={error}
            onDismiss={() => setHistoryOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
