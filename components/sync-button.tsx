"use client";

import { History, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { SyncHistoryPanel } from "@/components/sync-history-panel";
import { SyncStatusPanel } from "@/components/sync-status-panel";
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
  const [status, setStatus] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [metadata, setMetadata] = useState<GitSyncMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<{
    kind: "loading" | "success" | "noop" | "error";
    title: string;
    detail: string;
  } | null>(null);

  async function sync() {
    setHistoryOpen(false);
    setStatusOpen(true);
    setIsSyncing(true);
    setStatus("Syncing tracker data...");
    setError(null);
    setSyncNotice({
      kind: "loading",
      title: "Syncing tracker data",
      detail: "Saving tracked data changes into this repo.",
    });

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        kind?: "noop" | "commit";
        message?: string;
        files?: string[];
        commitMessage?: string;
        error?: string;
      };

      if (!response.ok || payload.ok === false) {
        const message = payload.error ?? payload.message ?? "Could not sync tracker data.";
        setStatus(message);
        setError(message);
        setSyncNotice({
          kind: "error",
          title: "Sync failed",
          detail: message,
        });
        return;
      }

      if (payload.kind === "noop") {
        const message = payload.message ?? "Nothing to sync.";
        setStatus(message);
        setSyncNotice({
          kind: "noop",
          title: "Already synced",
          detail: message,
        });
      } else {
        const fileCount = payload.files?.length ?? 0;
        const fileLabel = fileCount === 1 ? "file" : "files";
        const detail = payload.commitMessage
          ? `Saved ${fileCount} tracked ${fileLabel} in ${payload.commitMessage}.`
          : `Saved ${fileCount} tracked ${fileLabel}.`;

        setStatus("Tracker data committed.");
        setSyncNotice({
          kind: "success",
          title: "Tracker data committed",
          detail,
        });
      }

      const result = await fetchSyncMetadata();

      if (result.ok) {
        setMetadata(result.metadata);
        setError(null);
      } else {
        setError(result.error);
        if (payload.kind === "noop") {
          setSyncNotice({
            kind: "noop",
            title: "Already synced",
            detail: payload.message ?? "Nothing to sync.",
          });
        }
      }
    } catch {
      const message = "Could not sync tracker data.";
      setStatus(message);
      setError(message);
      setSyncNotice({
        kind: "error",
        title: "Sync failed",
        detail: message,
      });
    } finally {
      setIsSyncing(false);
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

  function toggleHistory() {
    setStatusOpen(false);
    setHistoryOpen((current) => !current);
  }

  return (
    <div className="sync-button">
      <button
        type="button"
        className="utility-button utility-button--sync"
        onClick={() => void sync()}
        disabled={isSyncing}
        aria-label="Sync tracker data"
        aria-busy={isSyncing}
      >
        <RefreshCcw size={16} className={isSyncing ? "sync-button__spinner" : undefined} />
      </button>
      <p className="sr-only" aria-live="polite">
        {status ?? ""}
      </p>
      <button
        type="button"
        className="utility-button utility-button--history"
        onClick={toggleHistory}
        aria-label={historyOpen ? "Hide sync history" : "View sync history"}
        aria-expanded={historyOpen}
      >
        <History size={16} />
      </button>
      {statusOpen && syncNotice ? (
        <div className="sync-button__popover">
          <SyncStatusPanel
            kind={syncNotice.kind}
            title={syncNotice.title}
            detail={syncNotice.detail}
            lastCommit={metadata?.lastSyncedCommit ?? null}
            onDismiss={() => setStatusOpen(false)}
          />
        </div>
      ) : null}
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
