export type Tone = "rose" | "berry" | "gold" | "mauve";

export const TONES: Record<Tone, { tint: string; from: string; to: string; ink: string }> = {
  rose: { tint: "#FFEAF1", from: "#E07A9C", to: "#C94F78", ink: "#A83960" },
  berry: { tint: "#F8E6EE", from: "#B85582", to: "#8E2F57", ink: "#7A2240" },
  gold: { tint: "#FBF2DC", from: "#E2BE5E", to: "#B8861A", ink: "#8A6414" },
  mauve: { tint: "#F3ECF0", from: "#A88A9A", to: "#7D6170", ink: "#5F4A55" },
};

export const chipStyle = (tone: Tone) => ({
  background: `linear-gradient(145deg, ${TONES[tone].from} 0%, ${TONES[tone].to} 70%)`,
  boxShadow: `0 6px 12px -5px ${TONES[tone].to}99, inset 0 1px 0 rgba(255,255,255,0.4)`,
});
