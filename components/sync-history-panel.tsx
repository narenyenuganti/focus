"use client";

import { X } from "lucide-react";
import type { GitSyncMetadata } from "@/lib/server/git-sync";

type SyncHistoryPanelProps = {
  metadata: GitSyncMetadata | null;
  loading?: boolean;
  error?: string | null;
  onDismiss: () => void;
};

function formatStatus(status: GitSyncMetadata["pendingFiles"][number]["status"]) {
  if (status === "untracked") {
    return "untracked";
  }

  return status;
}

function shortSha(sha: string) {
  return sha.slice(0, 7);
}

export function SyncHistoryPanel({
  metadata,
  loading = false,
  error = null,
  onDismiss,
}: SyncHistoryPanelProps) {
  return (
    <section
      className="panel-shell"
      style={{
        gap: "16px",
        padding: "16px",
        width: "100%",
        boxShadow: "0 18px 50px rgba(2, 2, 8, 0.32)",
      }}
      aria-label="Sync history"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 4 }}>
            Sync history
          </p>
          <h2 style={{ fontSize: "1.1rem" }}>Local sync metadata</h2>
        </div>
        <button
          type="button"
          className="utility-button"
          onClick={onDismiss}
          aria-label="Hide sync history"
        >
          <X size={14} />
        </button>
      </div>

      {loading ? <p className="focus-feedback">Loading sync history...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}

      {metadata ? (
        <>
          <div className="panel-metrics" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            <article>
              <span>Pending</span>
              <strong>{metadata.pendingCount}</strong>
            </article>
            <article>
              <span>Recent syncs</span>
              <strong>{metadata.recentCommits.length}</strong>
            </article>
            <article>
              <span>Last sync</span>
              <strong>{metadata.lastSyncedAt ? metadata.lastSyncedAt.slice(0, 10) : "-"}</strong>
            </article>
          </div>

          <div className="panel-list">
            {metadata.pendingFiles.length > 0 ? (
              metadata.pendingFiles.map((file) => (
                <article key={file.path}>
                  <strong>{file.path}</strong>
                  <span>
                    {formatStatus(file.status)}
                    {file.label ? ` • ${file.label}` : ""}
                  </span>
                </article>
              ))
            ) : (
              <article>
                <strong>Everything is synced</strong>
                <span>No tracked data files are pending.</span>
              </article>
            )}
          </div>

          <div className="panel-list">
            {metadata.recentCommits.length > 0 ? (
              metadata.recentCommits.slice(0, 3).map((commit) => (
                <article key={commit.sha}>
                  <strong>{commit.subject}</strong>
                  <span>
                    {shortSha(commit.sha)}
                    {commit.labels.length > 0 ? ` • ${commit.labels.join(", ")}` : ""}
                  </span>
                </article>
              ))
            ) : (
              <article>
                <strong>No sync commits yet</strong>
                <span>Manual sync history will appear here.</span>
              </article>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
