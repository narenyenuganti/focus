"use client";

import {
  AlertTriangle,
  CircleCheckBig,
  GitCommitHorizontal,
  LoaderCircle,
  X,
} from "lucide-react";
import type { GitSyncMetadata } from "@/lib/server/git-sync";

type SyncStatusKind = "loading" | "success" | "noop" | "error";

type SyncStatusPanelProps = {
  kind: SyncStatusKind;
  title: string;
  detail: string;
  lastCommit: GitSyncMetadata["lastSyncedCommit"] | null;
  onDismiss: () => void;
};

function shortSha(sha: string) {
  return sha.slice(0, 7);
}

function getStatusIcon(kind: SyncStatusKind) {
  if (kind === "loading") {
    return <LoaderCircle size={18} className="sync-status-panel__spinner" />;
  }

  if (kind === "error") {
    return <AlertTriangle size={18} />;
  }

  return <CircleCheckBig size={18} />;
}

export function SyncStatusPanel({
  kind,
  title,
  detail,
  lastCommit,
  onDismiss,
}: SyncStatusPanelProps) {
  return (
    <section
      className="panel-shell sync-status-panel"
      aria-label="Sync status"
      aria-live="polite"
    >
      <div className="sync-status-panel__header">
        <div>
          <p className="eyebrow">Sync status</p>
          <h2>{title}</h2>
        </div>
        <button
          type="button"
          className="utility-button"
          onClick={onDismiss}
          aria-label="Hide sync status"
        >
          <X size={14} />
        </button>
      </div>

      <div className={`sync-status-panel__summary is-${kind}`}>
        <span className="sync-status-panel__icon" aria-hidden="true">
          {getStatusIcon(kind)}
        </span>
        <p className={kind === "error" ? "error-message" : "focus-feedback"}>{detail}</p>
      </div>

      {lastCommit ? (
        <div className="panel-list">
          <article>
            <strong>{lastCommit.subject}</strong>
            <span>
              <GitCommitHorizontal size={12} />
              {shortSha(lastCommit.sha)} • {lastCommit.date.slice(0, 10)}
            </span>
          </article>
        </div>
      ) : null}
    </section>
  );
}
