"use client";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";

export function SyncButton() {
  const [status, setStatus] = useState("Manual sync");

  async function sync() {
    setStatus("Syncing tracker data...");

    const response = await fetch("/api/sync", {
      method: "POST",
    });
    const payload = (await response.json()) as { message?: string };

    setStatus(payload.message ?? "Sync complete");
  }

  return (
    <div className="sync-button">
      <button type="button" className="utility-button" onClick={() => void sync()}>
        <RefreshCcw size={16} />
        <span>Sync</span>
      </button>
      <p>{status}</p>
    </div>
  );
}
