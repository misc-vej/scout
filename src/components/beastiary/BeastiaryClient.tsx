"use client";

import { useState } from "react";
import Link from "next/link";
import { BeastiaryCard, DetailPanel } from "@/components/beastiary/BeastiaryCard";
import type { SpeciesCardData } from "@/components/beastiary/BeastiaryCard";
import { getRarityConfig } from "@/lib/rarity";

// ─── Types ───────────────────────────────────────────────────────────────────

type SpeciesRow = SpeciesCardData & {
  sightingCount?: number;
  personalityTrait: string | null;
  isShiny: boolean;
  firstSightedAt: string | null;
};

type BeastiaryClientProps = {
  speciesRows: SpeciesRow[];
  totalCollected: number;
  totalSpecies: number;
};

// ─── Rarity filter config ────────────────────────────────────────────────────

const RARITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "common", label: "Common" },
  { value: "uncommon", label: "Uncommon" },
  { value: "rare", label: "Rare" },
  { value: "super_rare", label: "V.Rare" },
  { value: "legendary", label: "Legendary" },
  { value: "mythic", label: "Mythic" },
];

function getRarityFilterColor(value: string): string {
  if (value === "all") return "#3a6a48";
  return getRarityConfig(value).borderColor;
}

// ─── Nav icons ────────────────────────────────────────────────────────────────

function IconNearby({ active }: { active: boolean }) {
  const s = active ? "#72cc4a" : "#2e5a3a";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="10" r="3.5" stroke={s} strokeWidth="1.7" />
      <path
        d="M12 2C7.58 2 4 5.58 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-4.42-3.58-8-8-8z"
        stroke={s}
        strokeWidth="1.7"
        fill="none"
      />
    </svg>
  );
}

function IconLogbook({ active }: { active: boolean }) {
  const s = active ? "#72cc4a" : "#2e5a3a";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke={s} strokeWidth="1.7" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" stroke={s} strokeWidth="1.7" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke={s} strokeWidth="1.7" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke={s} strokeWidth="1.7" />
    </svg>
  );
}

// ─── BeastiaryClient ──────────────────────────────────────────────────────────

export function BeastiaryClient({
  speciesRows,
  totalCollected,
  totalSpecies,
}: BeastiaryClientProps) {
  const [tab, setTab] = useState<"collection" | "lost">("collection");
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [selected, setSelected] = useState<SpeciesRow | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(
    null
  );

  const collected = speciesRows.filter((s) => s.sightingCount !== undefined);
  const locked = speciesRows.filter((s) => s.sightingCount === undefined);

  const listRaw = tab === "collection" ? collected : locked;
  const list =
    rarityFilter === "all"
      ? listRaw
      : listRaw.filter((s) => s.rarityTier === rarityFilter);

  function handleTabChange(newTab: "collection" | "lost") {
    setTab(newTab);
    setRarityFilter("all");
  }

  function handleCardTap(species: SpeciesCardData, personality: string | null) {
    const full = speciesRows.find((s) => s.id === species.id) ?? null;
    setSelected(full);
    setSelectedPersonality(personality);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a1410",
        fontFamily: "Outfit,sans-serif",
        display: "flex",
        flexDirection: "column",
        maxWidth: 390,
        margin: "0 auto",
      }}
    >
      {/* ── Nav bar ── */}
      <div
        style={{
          background: "linear-gradient(180deg,#0d1c12,#091410)",
          borderBottom: "1px solid rgba(114,204,74,.1)",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <span
          style={{
            fontFamily: "Syne,sans-serif",
            fontSize: 17,
            fontWeight: 800,
            color: "#e8f0e4",
            letterSpacing: ".07em",
            textTransform: "uppercase",
          }}
        >
          SCOUT
        </span>
        <div
          style={{
            background: "rgba(114,204,74,.12)",
            border: "1px solid rgba(114,204,74,.2)",
            borderRadius: 20,
            padding: "4px 10px",
            fontFamily: "Outfit,sans-serif",
            fontSize: 11,
            color: "#72cc4a",
            fontWeight: 600,
          }}
        >
          {totalCollected}/{totalSpecies}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div
        style={{
          background: "#091410",
          padding: "12px 16px 0",
          display: "flex",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {(
          [
            ["collection", "Collection", collected.length],
            ["lost", "Not Found", locked.length],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              cursor: "pointer",
              background: tab === key ? "#72cc4a" : "rgba(114,204,74,.07)",
              border:
                tab === key ? "none" : "1px solid rgba(114,204,74,.12)",
              fontFamily: "Syne,sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: tab === key ? "#0d1c12" : "#2e5a3a",
              transition: "all .15s",
            }}
          >
            {label}{" "}
            <span
              style={{
                fontFamily: "Outfit,sans-serif",
                fontSize: 11,
                fontWeight: 400,
                opacity: 0.7,
              }}
            >
              ({count})
            </span>
          </button>
        ))}
      </div>

      {/* ── Rarity filter pills ── */}
      <div
        style={{
          background: "#091410",
          padding: "10px 16px 12px",
          display: "flex",
          gap: 5,
          overflowX: "auto",
          scrollbarWidth: "none",
          flexShrink: 0,
        }}
      >
        {RARITY_FILTERS.map(({ value, label }) => {
          const color = getRarityFilterColor(value);
          const active = rarityFilter === value;
          return (
            <button
              key={value}
              onClick={() => setRarityFilter(value)}
              style={{
                flexShrink: 0,
                borderRadius: 20,
                padding: "5px 11px",
                cursor: "pointer",
                background: active ? color + "22" : "transparent",
                border: active
                  ? `1px solid ${color}`
                  : "1px solid rgba(255,255,255,.06)",
                fontFamily: "Outfit,sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: active ? color : "#2e5a3a",
                transition: "all .15s",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Card grid ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 14px 100px",
        }}
      >
        {list.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
            }}
          >
            {list.map((s) => (
              <BeastiaryCard
                key={s.id}
                species={{
                  id: s.id,
                  commonName: s.commonName,
                  scientificName: s.scientificName,
                  rarityTier: s.rarityTier,
                  speciesType: s.speciesType,
                  funFact: s.funFact,
                  spottingTips: s.spottingTips,
                  sensitivityLevel: s.sensitivityLevel,
                  no: s.no,
                  habitat: s.habitat,
                }}
                sightingCount={s.sightingCount}
                personalityTrait={s.personalityTrait}
                isShiny={s.isShiny}
                firstSightedAt={s.firstSightedAt}
                onCardTap={handleCardTap}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div
              style={{
                fontFamily: "Syne,sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#1e3828",
                textTransform: "uppercase",
                letterSpacing: ".05em",
              }}
            >
              Nothing here
            </div>
            <div
              style={{
                fontFamily: "Outfit,sans-serif",
                fontSize: 12,
                color: "#162218",
                marginTop: 6,
              }}
            >
              Try a different filter.
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 390,
          background:
            "linear-gradient(to top,#0a1410 65%,rgba(10,20,16,0))",
          padding: "8px 0 20px",
          display: "flex",
          justifyContent: "space-around",
          zIndex: 40,
        }}
      >
        <Link
          href="/discover"
          style={{
            textAlign: "center",
            cursor: "pointer",
            minWidth: 80,
            padding: "4px 0",
            textDecoration: "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <IconNearby active={false} />
          </div>
          <div
            style={{
              fontFamily: "Outfit,sans-serif",
              fontSize: 9,
              fontWeight: 600,
              color: "#2e5a3a",
              marginTop: 4,
              letterSpacing: ".06em",
              textTransform: "uppercase",
            }}
          >
            Nearby
          </div>
        </Link>
        <div
          style={{
            textAlign: "center",
            cursor: "pointer",
            minWidth: 80,
            padding: "4px 0",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <IconLogbook active={true} />
          </div>
          <div
            style={{
              fontFamily: "Outfit,sans-serif",
              fontSize: 9,
              fontWeight: 600,
              color: "#72cc4a",
              marginTop: 4,
              letterSpacing: ".06em",
              textTransform: "uppercase",
            }}
          >
            Logbook
          </div>
          <div
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#72cc4a",
              margin: "3px auto 0",
            }}
          />
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selected && (
        <DetailPanel
          species={{
            id: selected.id,
            commonName: selected.commonName,
            scientificName: selected.scientificName,
            rarityTier: selected.rarityTier,
            speciesType: selected.speciesType,
            funFact: selected.funFact,
            spottingTips: selected.spottingTips,
            sensitivityLevel: selected.sensitivityLevel,
            no: selected.no,
            habitat: selected.habitat,
          }}
          personalityTrait={selectedPersonality}
          firstSightedAt={selected.firstSightedAt}
          sightingCount={selected.sightingCount ?? 1}
          isShiny={selected.isShiny}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
