"use client";

import { Volume2, VolumeX } from "lucide-react";

type MuteButtonProps = {
  muted: boolean;
  onToggle: () => void;
};

export function MuteButton({ muted, onToggle }: MuteButtonProps) {
  const Icon = muted ? VolumeX : Volume2;

  return (
    <button
      type="button"
      className="utility-button"
      aria-label={muted ? "Unmute ambient music" : "Mute ambient music"}
      onClick={onToggle}
      style={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}
    >
      <Icon size={16} />
    </button>
  );
}
