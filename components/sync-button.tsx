"use client";

import { History, RefreshCcw } from "lucide-react";
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
    setHistoryOpen(true);
    setStatus("Syncing tracker data...");
    setError(null);
    setMetadata(null);

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
      });
      const payload = (await response.json()) as { message?: string };

      setStatus(payload.message ?? "Sync complete");
      const result = await fetchSyncMetadata();

      if (result.ok) {
        setMetadata(result.metadata);
        setError(null);
      } else {
        setError(result.error);
        setStatus(result.error);
      }
    } catch {
      const message = "Could not sync tracker data.";
      setStatus(message);
      setError(message);
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
        setStatus(result.error);
      }
    })();
  }, []);

  return (
    <div className="sync-button">
      <button
        type="button"
        className="utility-button utility-button--sync"
        onClick={() => void sync()}
        aria-label="Sync tracker data"
      >
        <RefreshCcw size={16} />
      </button>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      <button
        type="button"
        className="utility-button utility-button--history"
        onClick={() => setHistoryOpen((current) => !current)}
        aria-label={historyOpen ? "Hide sync history" : "View sync history"}
        aria-expanded={historyOpen}
      >
        <History size={16} />
      </button>
      {historyOpen ? (
        <div className="sync-button__popover">
          <SyncHistoryPanel
            metadata={metadata}
            loading={!metadata && !error}
            error={error}
            notice={status}
            onDismiss={() => setHistoryOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
