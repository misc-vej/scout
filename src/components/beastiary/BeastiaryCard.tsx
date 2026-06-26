"use client";

import { useState } from "react";
import { AnimalIcon } from "@/components/shared/AnimalIcon";
import { getRarityConfig } from "@/lib/rarity";
// PersonalityPicker preserved — no longer rendered here; personality is set in the Nearby log modal
import { PersonalityPicker } from "./PersonalityPicker";
void PersonalityPicker; // kept for import preservation

export type SpeciesCardData = {
  id: string;
  commonName: string;
  scientificName: string;
  rarityTier: string;
  speciesType: string | null;
  funFact: string | null;
  spottingTips: string | null;
  sensitivityLevel: string;
  no: string;         // zero-padded card number, e.g. "#001"
  habitat: string | null;
  imageUrl?: string | null;
};

export type BeastiaryCardProps = {
  species: SpeciesCardData;
  sightingCount?: number;
  personalityTrait?: string | null;
  isShiny?: boolean;
  firstSightedAt?: string | null;
  onCardTap: (species: SpeciesCardData, personalityTrait: string | null) => void;
};

export function BeastiaryCard({
  species,
  sightingCount,
  personalityTrait,
  isShiny = false,
  firstSightedAt,
  onCardTap,
}: BeastiaryCardProps) {
  const [hovered, setHovered] = useState(false);
  const isCollected = sightingCount !== undefined;

  if (isCollected) {
    return (
      <CollectedCard
        species={species}
        sightingCount={sightingCount!}
        personalityTrait={personalityTrait ?? null}
        isShiny={isShiny}
        firstSightedAt={firstSightedAt ?? null}
        hovered={hovered}
        onHover={() => setHovered(true)}
        onLeave={() => setHovered(false)}
        onCardTap={onCardTap}
      />
    );
  }

  return (
    <LockedCard
      species={species}
      hovered={hovered}
      onHover={() => setHovered(true)}
      onLeave={() => setHovered(false)}
    />
  );
}

// ─── CollectedCard ──────────────────────────────────────────────────────────

type CollectedCardProps = {
  species: SpeciesCardData;
  sightingCount: number;
  personalityTrait: string | null;
  isShiny: boolean;
  firstSightedAt: string | null;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onCardTap: (species: SpeciesCardData, personalityTrait: string | null) => void;
};

function CollectedCard({
  species,
  personalityTrait,
  isShiny,
  hovered,
  onHover,
  onLeave,
  onCardTap,
}: CollectedCardProps) {
  const rarityConfig = getRarityConfig(species.rarityTier);
  const borderColor = isShiny ? "#fff" : rarityConfig.borderColor;
  const anim = isShiny
    ? "white-glow 2s ease-in-out infinite"
    : rarityConfig.glowAnimation;
  const iconColor = isShiny
    ? "rgba(255,255,255,.45)"
    : rarityConfig.borderColor + "77";
  const hasImage = Boolean(species.imageUrl);

  return (
    <div
      onClick={() => onCardTap(species, personalityTrait)}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        border: `2.5px solid ${borderColor}`,
        background: rarityConfig.artBg,
        animation: anim,
        aspectRatio: "5/7",
        transform: hovered ? "scale(1.04)" : "scale(1)",
        transition: "transform .15s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Shiny shimmer overlay */}
      {isShiny && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg,rgba(255,255,255,0) 30%,rgba(255,255,255,.05) 50%,rgba(255,255,255,0) 70%)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Art zone */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          minHeight: 0,
          ...(hasImage ? {
            backgroundImage: `url(${species.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}),
        }}
      >
        {!hasImage && (
          <AnimalIcon
            type={species.speciesType ?? "bird"}
            color={iconColor}
          />
        )}
        <div className="grain" />
      </div>

      {/* Info strip */}
      <div
        style={{
          padding: "5px 7px 8px",
          flexShrink: 0,
          zIndex: 3,
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: "Outfit,sans-serif",
            fontSize: 9,
            fontWeight: 600,
            color: isShiny ? "#fff" : rarityConfig.borderColor,
            textTransform: "uppercase",
            letterSpacing: ".06em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {isShiny ? "✦ Shiny" : rarityConfig.label}
        </div>
        <div
          style={{
            fontFamily: "Syne,sans-serif",
            fontSize: 10.5,
            fontWeight: 700,
            color: "#1c2e1e",
            textTransform: "uppercase",
            letterSpacing: ".02em",
            lineHeight: 1.15,
            marginTop: 2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {species.commonName}
        </div>
        {personalityTrait && (
          <span
            style={{
              background: "rgba(184,120,232,.15)",
              border: "1px solid rgba(184,120,232,.22)",
              fontFamily: "Outfit,sans-serif",
              fontSize: 7.5,
              color: "#b878e8",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 20,
              marginTop: 3,
              display: "inline-block",
            }}
          >
            {personalityTrait}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── LockedCard ──────────────────────────────────────────────────────────────

type LockedCardProps = {
  species: SpeciesCardData;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
};

function LockedCard({ species, hovered, onHover, onLeave }: LockedCardProps) {
  const rarityConfig = getRarityConfig(species.rarityTier);

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        border: `2.5px solid ${rarityConfig.borderColor}`,
        background: "#e8d8c0",
        aspectRatio: "5/7",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "scale(1.04)" : "scale(1)",
        transition: "transform .15s ease",
      }}
    >
      {/* Art zone */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          minHeight: 0,
        }}
      >
        <span
          style={{
            fontFamily: "Syne,sans-serif",
            fontSize: 46,
            fontWeight: 800,
            color: rarityConfig.borderColor + "18",
            lineHeight: 1,
            position: "relative",
            zIndex: 2,
          }}
        >
          ?
        </span>
        <div className="grain" style={{ opacity: 0.4 }} />
      </div>

      {/* Info strip */}
      <div style={{ padding: "5px 7px 8px", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "Outfit,sans-serif",
            fontSize: 9,
            fontWeight: 600,
            color: rarityConfig.borderColor,
            textTransform: "uppercase",
            letterSpacing: ".06em",
            opacity: 0.5,
          }}
        >
          {rarityConfig.label}
        </div>
        <div
          style={{
            fontFamily: "Outfit,sans-serif",
            fontSize: 9,
            color: "rgba(28,46,30,.3)",
            marginTop: 2,
            fontStyle: "italic",
          }}
        >
          Not found
        </div>
      </div>
    </div>
  );
}

// ─── DetailPanel ─────────────────────────────────────────────────────────────

export type DetailPanelProps = {
  species: SpeciesCardData;
  personalityTrait: string | null;
  firstSightedAt: string | null;
  sightingCount: number;
  isShiny?: boolean;
  onClose: () => void;
};

export function DetailPanel({
  species,
  personalityTrait,
  firstSightedAt,
  sightingCount,
  isShiny = false,
  onClose,
}: DetailPanelProps) {
  const rarityConfig = getRarityConfig(species.rarityTier);
  const borderColor = isShiny ? "#fff" : rarityConfig.borderColor;
  const anim = isShiny
    ? "white-glow 2s ease-in-out infinite"
    : rarityConfig.glowAnimation;
  const iconColor = isShiny
    ? "rgba(255,255,255,.45)"
    : rarityConfig.borderColor + "66";
  const hasImage = Boolean(species.imageUrl);

  // Format first seen date as "Jun 25"
  let firstSeenLabel = "—";
  if (firstSightedAt) {
    const d = new Date(firstSightedAt);
    firstSeenLabel = d.toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 390,
          background: "#f5f0e4",
          borderRadius: "20px 20px 0 0",
          border: `3px solid ${borderColor}`,
          borderBottom: "none",
          animation: anim,
          overflow: "hidden",
          paddingBottom: "env(safe-area-inset-bottom,16px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "10px 0 0",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              background: "rgba(28,46,30,.08)",
              borderRadius: 2,
            }}
          />
        </div>

        {/* Art zone */}
        <div
          style={{
            height: 180,
            background: `linear-gradient(160deg,${rarityConfig.artBg},#e8d8c0)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            margin: "8px 14px 0",
            borderRadius: 12,
            overflow: "hidden",
            ...(hasImage ? {
              backgroundImage: `url(${species.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {}),
          }}
        >
          {!hasImage && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnimalIcon
                type={species.speciesType ?? "bird"}
                color={iconColor}
              />
            </div>
          )}
          {/* Tier badge top-left */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 12,
              background: "rgba(245,240,228,.7)",
              border: `1px solid ${borderColor}`,
              borderRadius: 20,
              padding: "3px 9px",
              zIndex: 3,
            }}
          >
            <span
              style={{
                fontFamily: "Outfit,sans-serif",
                fontSize: 9,
                color: isShiny ? "#fff" : rarityConfig.borderColor,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
            >
              {isShiny ? "✦ Shiny" : rarityConfig.label}
            </span>
          </div>
          {/* Card number top-right */}
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              zIndex: 3,
            }}
          >
            <span
              style={{
                fontFamily: "Outfit,sans-serif",
                fontSize: 9,
                color: "rgba(28,46,30,.3)",
              }}
            >
              {species.no}
            </span>
          </div>
          <div className="grain" />
        </div>

        {/* Info body */}
        <div style={{ padding: "14px 18px 20px" }}>
          {/* Name */}
          <div
            style={{
              fontFamily: "Syne,sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: "#1c2e1e",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              lineHeight: 1,
            }}
          >
            {species.commonName}
          </div>
          {/* Latin */}
          <div
            style={{
              fontFamily: "Outfit,sans-serif",
              fontSize: 11,
              color: "#6a9a78",
              fontStyle: "italic",
              marginTop: 3,
            }}
          >
            {species.scientificName}
          </div>

          {/* Chips */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            {personalityTrait && (
              <span
                style={{
                  background: "rgba(184,120,232,.15)",
                  border: "1px solid rgba(184,120,232,.25)",
                  fontFamily: "Outfit,sans-serif",
                  fontSize: 10,
                  color: "#b878e8",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: 20,
                }}
              >
                {personalityTrait}
              </span>
            )}
            {species.habitat && (
              <span
                style={{
                  background: "rgba(42,122,72,.1)",
                  border: "1px solid rgba(42,122,72,.18)",
                  fontFamily: "Outfit,sans-serif",
                  fontSize: 10,
                  color: "#2a7a48",
                  padding: "5px 12px",
                  borderRadius: 20,
                }}
              >
                {species.habitat}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div
            style={{
              marginTop: 14,
              borderTop: "1px solid rgba(28,46,30,.1)",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            {[
              [String(sightingCount), "spotted"],
              [firstSeenLabel, "first seen"],
            ].map(([value, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "Syne,sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1c2e1e",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: "Outfit,sans-serif",
                    fontSize: 8,
                    color: "#6a9a78",
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    marginTop: 3,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
