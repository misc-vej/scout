export interface RarityConfig {
  borderColor: string;
  artBg: string;
  glowAnimation: string;
  label: string;
}

const RARITY_MAP: Record<string, RarityConfig> = {
  common: {
    borderColor: "#6a9070",
    artBg: "#162a1e",
    glowAnimation: "none",
    label: "Common",
  },
  uncommon: {
    borderColor: "#5a90d0",
    artBg: "#0e1828",
    glowAnimation: "none",
    label: "Uncommon",
  },
  rare: {
    borderColor: "#c8922a",
    artBg: "#1c1402",
    glowAnimation: "gold-glow 2.8s ease-in-out infinite",
    label: "Rare",
  },
  super_rare: {
    borderColor: "#c86030",
    artBg: "#1c0c04",
    glowAnimation: "orange-glow 2.4s ease-in-out infinite",
    label: "Very Rare",
  },
  veryrare: {
    borderColor: "#c86030",
    artBg: "#1c0c04",
    glowAnimation: "orange-glow 2.4s ease-in-out infinite",
    label: "Very Rare",
  },
  legendary: {
    borderColor: "#9060e0",
    artBg: "#140a24",
    glowAnimation: "purple-glow 2.2s ease-in-out infinite",
    label: "Legendary",
  },
  mythic: {
    borderColor: "rgba(185,205,255,.8)",
    artBg: "#0e1222",
    glowAnimation: "silver-glow 2.2s ease-in-out infinite",
    label: "Mythic",
  },
  shiny: {
    borderColor: "#ffffff",
    artBg: "#18202c",
    glowAnimation: "white-glow 2.0s ease-in-out infinite",
    label: "Shiny",
  },
};

function getRarityConfig(tier: string): RarityConfig {
  return RARITY_MAP[tier] ?? RARITY_MAP.common;
}

export { getRarityConfig };
