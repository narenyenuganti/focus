"use client";

import { GardenScene } from "@/components/garden-scene";

type GardenViewProps = {
  seeds: number;
  plantsCount: number;
  streakDays: number;
  owned: ReadonlySet<string>;
  theme: string;
};

export function GardenView({ owned, theme }: GardenViewProps) {
  return <GardenScene theme={theme} owned={owned} />;
}
