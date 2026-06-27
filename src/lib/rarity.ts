export interface RarityConfig {
  borderColor: string;
  artBg: string;
  glowAnimation: string;
  label: string;
}

const RARITY_MAP: Record<string, RarityConfig> = {
  common: {
    borderColor: "#4a9a5a",
    artBg: "#2d6e3a",
    glowAnimation: "none",
    label: "Common",
  },
  uncommon: {
    borderColor: "#5a90d0",
    artBg: "#274fa0",
    glowAnimation: "none",
    label: "Uncommon",
  },
  rare: {
    borderColor: "#c8922a",
    artBg: "#b07820",
    glowAnimation: "gold-glow 2.8s ease-in-out infinite",
    label: "Rare",
  },
  super_rare: {
    borderColor: "#c86030",
    artBg: "#a04820",
    glowAnimation: "orange-glow 2.4s ease-in-out infinite",
    label: "Very Rare",
  },
  veryrare: {
    borderColor: "#c86030",
    artBg: "#a04820",
    glowAnimation: "orange-glow 2.4s ease-in-out infinite",
    label: "Very Rare",
  },
  legendary: {
    borderColor: "#9060e0",
    artBg: "#6030b0",
    glowAnimation: "purple-glow 2.2s ease-in-out infinite",
    label: "Legendary",
  },
  mythic: {
    borderColor: "#b9cdff",
    artBg: "linear-gradient(160deg,#2a50a0 0%,#6030b0 100%)",
    glowAnimation: "silver-glow 2.2s ease-in-out infinite",
    label: "Mythic",
  },
  shiny: {
    borderColor: "#9898c8",
    artBg: "#6868a8",
    glowAnimation: "white-glow 2.0s ease-in-out infinite",
    label: "Shiny",
  },
};

function getRarityConfig(tier: string): RarityConfig {
  return RARITY_MAP[tier] ?? RARITY_MAP.common;
}

export { getRarityConfig };
