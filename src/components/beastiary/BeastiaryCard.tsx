"use client";

import { useState, useEffect } from "react";
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
  description?: string | null;
  conservationStatus?: string | null;
};

export type BeastiaryCardProps = {
  species: SpeciesCardData;
  sightingCount?: number;
  personalityTrait?: string | null;
  isShiny?: boolean;
  firstSightedAt?: string | null;
  verificationStatus?: string | null;
  collectionId?: string | null;
  onCardTap: (species: SpeciesCardData, personalityTrait: string | null) => void;
  style?: React.CSSProperties;
};

export function BeastiaryCard({
  species,
  sightingCount,
  personalityTrait,
  isShiny = false,
  firstSightedAt,
  verificationStatus,
  collectionId,
  onCardTap,
  style,
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
        verificationStatus={verificationStatus ?? null}
        hovered={hovered}
        onHover={() => setHovered(true)}
        onLeave={() => setHovered(false)}
        onCardTap={onCardTap}
        style={style}
      />
    );
  }

  return (
    <LockedCard
      species={species}
      hovered={hovered}
      onHover={() => setHovered(true)}
      onLeave={() => setHovered(false)}
      style={style}
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
  verificationStatus?: string | null;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onCardTap: (species: SpeciesCardData, personalityTrait: string | null) => void;
  style?: React.CSSProperties;
};

function CollectedCard({
  species,
  personalityTrait,
  isShiny,
  verificationStatus,
  hovered,
  onHover,
  onLeave,
  onCardTap,
  style,
}: CollectedCardProps) {
  const rarityConfig = getRarityConfig(species.rarityTier);
  const borderColor = isShiny ? "#fff" : rarityConfig.borderColor;
  // Task 2A: white semi-opaque icon on vivid art zone background
  const iconColor = "rgba(255,255,255,0.72)";
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
        aspectRatio: "5/7",
        transform: hovered ? "scale(1.04)" : "scale(1)",
        transition: "transform .15s ease",
        display: "flex",
        flexDirection: "column",
        ...style,
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
            backgroundSize: "cover",
            backgroundPosition: "center",
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
        {/* Verification status chip — top-left of art zone */}
        {verificationStatus === 'verified' && (
          <div style={{
            position: "absolute",
            top: 6, left: 6, zIndex: 4,
            background: "#2a7a48",
            borderRadius: 10,
            padding: "2px 6px",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <span style={{ fontSize: 8, color: "#f5f0e4", fontWeight: 700, letterSpacing: ".04em", fontFamily: "Outfit,sans-serif" }}>✓ VERIFIED</span>
          </div>
        )}
        {verificationStatus === 'pending' && (
          <div style={{
            position: "absolute",
            top: 6, left: 6, zIndex: 4,
            background: "rgba(200,146,42,.85)",
            borderRadius: 10,
            padding: "2px 6px",
            display: "flex", alignItems: "center", gap: 3,
          }}>
            <span style={{ fontSize: 8, color: "#fff", fontWeight: 700, letterSpacing: ".04em", fontFamily: "Outfit,sans-serif" }}>⏳ PENDING</span>
          </div>
        )}
      </div>

      {/* Info strip — Task 2B: white background */}
      <div
        style={{
          padding: "5px 7px 8px",
          flexShrink: 0,
          zIndex: 3,
          position: "relative",
          overflow: "hidden",
          background: "#ffffff",
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
  style?: React.CSSProperties;
};

function LockedCard({ species, hovered, onHover, onLeave, style }: LockedCardProps) {
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

// ─── helpers ───────────────────────────────────────────────────────────────

function sensitivityLabel(level: string): string {
  if (level === "caution") return "Approach with care";
  if (level === "sensitive") return "Sensitive species — maintain distance";
  if (level === "restricted") return "Restricted — do not approach";
  return level;
}

function BackSection({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "Outfit,sans-serif",
          fontSize: 8,
          fontWeight: 700,
          color: accent,
          textTransform: "uppercase" as const,
          letterSpacing: ".12em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "Outfit,sans-serif",
          fontSize: 11,
          color: "rgba(245,240,228,.82)",
          lineHeight: 1.55,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── VerifyButton ─────────────────────────────────────────────────────────────

function VerifyButton({ collectionId, wasRejected }: { collectionId: string; wasRejected: boolean }) {
  const [open, setOpen] = useState(false);
  const [evidenceType, setEvidenceType] = useState<"photo" | "description">("photo");
  const [evidenceData, setEvidenceData] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError("Photo must be under 4 MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setEvidenceData(ev.target?.result as string ?? "");
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!evidenceData) { setError("Please add a photo or description"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/verify/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId, evidenceType, evidenceData }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Failed to submit");
      } else {
        setSubmitted(true);
        setOpen(false);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#c8922a", fontWeight: 600 }}>⏳ Submitted for review</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        style={{
          width: "100%",
          background: wasRejected ? "rgba(200,96,48,.08)" : "rgba(42,122,72,.07)",
          border: `1.5px solid ${wasRejected ? "#c86030" : "#2a7a48"}`,
          borderRadius: 8,
          padding: "7px 0",
          fontFamily: "Outfit,sans-serif",
          fontSize: 11,
          fontWeight: 700,
          color: wasRejected ? "#c86030" : "#2a7a48",
          cursor: "pointer",
          letterSpacing: ".03em",
        }}
      >
        {wasRejected ? "Resubmit evidence" : "Get verified → submit evidence"}
      </button>

      {open && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => { e.stopPropagation(); setOpen(false); }}
        >
          <div
            style={{ background: "#f5f0e4", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 390 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 16, fontWeight: 800, color: "#1c2e1e", marginBottom: 4 }}>Verify your spot</div>
            <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#6a9a78", marginBottom: 18 }}>
              Share evidence and a fellow naturalist will review it. Verified spots count towards your badges.
            </div>

            {/* Type selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {(["photo", "description"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setEvidenceType(t); setEvidenceData(""); setError(""); }}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer",
                    background: evidenceType === t ? "#2a7a48" : "rgba(42,122,72,.06)",
                    border: evidenceType === t ? "none" : "1px solid rgba(42,122,72,.12)",
                    fontFamily: "Outfit,sans-serif", fontSize: 12, fontWeight: 600,
                    color: evidenceType === t ? "#f5f0e4" : "#6a9a78",
                  }}
                >
                  {t === "photo" ? "📷 Photo" : "📝 Description"}
                </button>
              ))}
            </div>

            {evidenceType === "photo" ? (
              <div>
                <label style={{
                  display: "block", width: "100%", padding: "28px 0", textAlign: "center",
                  background: "#e8d8c0", borderRadius: 12, cursor: "pointer",
                  fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#6a9a78",
                  border: "2px dashed rgba(28,46,30,.12)",
                }}>
                  {evidenceData ? "✓ Photo ready" : "Tap to select a photo"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                </label>
              </div>
            ) : (
              <textarea
                value={evidenceData}
                onChange={(e) => setEvidenceData(e.target.value)}
                placeholder="Describe what you saw — location, behaviour, distinctive markings…"
                rows={4}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10,
                  border: "1.5px solid rgba(28,46,30,.12)", background: "#fff",
                  fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#1c2e1e",
                  resize: "none", boxSizing: "border-box",
                }}
              />
            )}

            {error && <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#c86030", marginTop: 8 }}>{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={submitting || !evidenceData}
              style={{
                marginTop: 14, width: "100%", padding: "12px 0",
                background: submitting || !evidenceData ? "rgba(42,122,72,.25)" : "#2a7a48",
                border: "none", borderRadius: 12, cursor: submitting || !evidenceData ? "default" : "pointer",
                fontFamily: "Syne,sans-serif", fontSize: 14, fontWeight: 700,
                color: "#f5f0e4", letterSpacing: ".03em",
              }}
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── DetailPanel ─────────────────────────────────────────────────────────────

export type DetailPanelProps = {
  species: SpeciesCardData;
  personalityTrait: string | null;
  firstSightedAt: string | null;
  sightingCount: number;
  isShiny?: boolean;
  verificationStatus?: string | null;
  collectionId?: string | null;
  onClose: () => void;
};

export function DetailPanel({
  species,
  personalityTrait,
  firstSightedAt,
  sightingCount,
  isShiny = false,
  verificationStatus,
  collectionId,
  onClose,
}: DetailPanelProps) {
  const rarityConfig = getRarityConfig(species.rarityTier);
  const borderColor = isShiny ? "#fff" : rarityConfig.borderColor;
  const glowAnim = isShiny
    ? "white-glow 2s ease-in-out infinite"
    : rarityConfig.glowAnimation;
  const iconColor = "rgba(255,255,255,0.7)";
  const hasImage = Boolean(species.imageUrl);

  const [glowActive, setGlowActive] = useState(false);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGlowActive(true), 450);
    return () => clearTimeout(t);
  }, []);

  let firstSeenLabel = "—";
  if (firstSightedAt) {
    const d = new Date(firstSightedAt);
    firstSeenLabel = d.toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
    });
  }

  // After the entrance animation finishes, hand control to inline transform.
  // While card-reveal is in the animation list its fill-mode overrides transform;
  // once glowActive we remove it so the flip transition can take effect.
  const cardAnimStyle: React.CSSProperties = glowActive
    ? {
        opacity: 1,
        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        transition: "transform 0.55s cubic-bezier(.4,0,.2,1)",
        animation:
          glowAnim !== "none" ? glowAnim : undefined,
      }
    : {
        animation:
          "card-reveal 0.45s cubic-bezier(.22,.68,0,1.2) forwards",
      };

  const hasBackContent =
    species.description ||
    species.funFact ||
    species.spottingTips ||
    species.conservationStatus ||
    (species.sensitivityLevel && species.sensitivityLevel !== "none");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.8)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Perspective wrapper — stops propagation so clicks inside don't close */}
      <div
        style={{ perspective: 1200 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* The card — flips on tap once revealed */}
        <div
          style={{
            width: 260,
            height: 364,
            borderRadius: 16,
            border: `3px solid ${borderColor}`,
            position: "relative",
            transformStyle: "preserve-3d",
            cursor: glowActive ? "pointer" : "default",
            ...cardAnimStyle,
          }}
          onClick={() => {
            if (glowActive) setFlipped((f) => !f);
          }}
        >
          {/* ── FRONT FACE ─────────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 13,
              overflow: "hidden",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden" as unknown as "hidden",
              background: "#f5f0e4",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 10,
                background: "rgba(0,0,0,.35)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1,
              }}
              aria-label="Close"
            >
              ×
            </button>

            {/* Art zone */}
            <div
              style={{
                flex: 1,
                background: rarityConfig.artBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                ...(hasImage
                  ? {
                      backgroundImage: `url(${species.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}),
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
                style={{ position: "absolute", top: 10, right: 12, zIndex: 3 }}
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
              {/* Tap hint — fades in after reveal */}
              {hasBackContent && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    animation: "fade-up 0.3s 0.5s ease both",
                    zIndex: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Outfit,sans-serif",
                      fontSize: 8,
                      color: "rgba(245,240,228,.55)",
                      textTransform: "uppercase",
                      letterSpacing: ".1em",
                    }}
                  >
                    tap for field notes
                  </span>
                </div>
              )}
            </div>

            {/* Info body */}
            <div style={{ padding: "10px 14px 14px", background: "#f5f0e4", flex: 1, overflowY: "auto" }}>
              <div
                style={{
                  fontFamily: "Syne,sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#1c2e1e",
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  lineHeight: 1.1,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {species.commonName}
              </div>
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
                {species.sensitivityLevel !== "none" && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "rgba(240,160,32,0.1)",
                      border: "1px solid rgba(240,160,32,0.3)",
                      fontFamily: "Outfit,sans-serif",
                      fontSize: 10,
                      color: "#a06810",
                      fontWeight: 600,
                      padding: "5px 12px",
                      borderRadius: 20,
                      animation: "sensitivity-pulse 2.8s ease-in-out infinite",
                    }}
                  >
                    ⚠{" "}
                    {species.sensitivityLevel.charAt(0).toUpperCase() +
                      species.sensitivityLevel.slice(1)}
                  </span>
                )}
              </div>
              <div
                style={{
                  marginTop: 12,
                  borderTop: "1px solid rgba(28,46,30,.1)",
                  paddingTop: 10,
                  display: "flex",
                  justifyContent: "space-around",
                }}
              >
                {(
                  [
                    [String(sightingCount), "spotted"],
                    [firstSeenLabel, "first seen"],
                  ] as [string, string][]
                ).map(([value, label]) => (
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

            {/* Verification strip */}
            <div style={{
              padding: "8px 12px",
              borderTop: "1px solid rgba(28,46,30,.06)",
              background: "#faf8f2",
              flexShrink: 0,
            }}>
              {verificationStatus === 'verified' && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#2a7a48", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 10, color: "#fff" }}>✓</span>
                  </div>
                  <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#2a7a48", fontWeight: 600 }}>Verified sighting</span>
                </div>
              )}
              {verificationStatus === 'pending' && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(200,146,42,.15)", border: "1.5px solid #c8922a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 9 }}>⏳</span>
                  </div>
                  <span style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#c8922a", fontWeight: 600 }}>Awaiting community review</span>
                </div>
              )}
              {(verificationStatus === 'unverified' || verificationStatus === 'rejected' || !verificationStatus) && collectionId && (
                <VerifyButton collectionId={collectionId} wasRejected={verificationStatus === 'rejected'} />
              )}
            </div>
          </div>

          {/* ── BACK FACE ──────────────────────────────────────────────── */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 13,
              overflow: "hidden",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden" as unknown as "hidden",
              transform: "rotateY(180deg)",
              background: "#1c2e1e",
              display: "flex",
              flexDirection: "column",
              padding: "15px 15px 12px",
            }}
          >
            {/* Header row: FIELD NOTES label + name + close button */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 10,
                gap: 8,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "Outfit,sans-serif",
                    fontSize: 8,
                    fontWeight: 700,
                    color: borderColor,
                    textTransform: "uppercase",
                    letterSpacing: ".15em",
                    marginBottom: 4,
                  }}
                >
                  Field Notes
                </div>
                <div
                  style={{
                    fontFamily: "Syne,sans-serif",
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#f5f0e4",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    lineHeight: 1.1,
                    wordBreak: "break-word",
                  }}
                >
                  {species.commonName}
                </div>
                <div
                  style={{
                    fontFamily: "Outfit,sans-serif",
                    fontSize: 9,
                    color: "rgba(245,240,228,.45)",
                    fontStyle: "italic",
                    marginTop: 2,
                  }}
                >
                  {species.scientificName}
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                style={{
                  background: "rgba(245,240,228,.12)",
                  color: "rgba(245,240,228,.65)",
                  border: "none",
                  borderRadius: "50%",
                  width: 26,
                  height: 26,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: `${borderColor}30`,
                marginBottom: 12,
                flexShrink: 0,
              }}
            />

            {/* Scrollable content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {species.description && (
                <BackSection label="About" accent={borderColor}>
                  {species.description}
                </BackSection>
              )}
              {species.funFact && (
                <BackSection label="Did you know" accent={borderColor}>
                  {species.funFact}
                </BackSection>
              )}
              {species.spottingTips && (
                <BackSection label="In the field" accent={borderColor}>
                  {species.spottingTips}
                </BackSection>
              )}
              {(species.conservationStatus ||
                (species.sensitivityLevel &&
                  species.sensitivityLevel !== "none")) && (
                <BackSection label="Status" accent={borderColor}>
                  {species.conservationStatus && (
                    <div>{species.conservationStatus}</div>
                  )}
                  {species.sensitivityLevel &&
                    species.sensitivityLevel !== "none" && (
                      <div
                        style={{
                          marginTop: species.conservationStatus ? 4 : 0,
                          color: "rgba(240,192,64,.85)",
                        }}
                      >
                        ⚠ {sensitivityLabel(species.sensitivityLevel)}
                      </div>
                    )}
                </BackSection>
              )}
              {!hasBackContent && (
                <div
                  style={{
                    fontFamily: "Outfit,sans-serif",
                    fontSize: 11,
                    color: "rgba(245,240,228,.28)",
                    textAlign: "center",
                    marginTop: 24,
                  }}
                >
                  No field notes yet
                </div>
              )}
            </div>

            {/* Flip-back hint */}
            <div
              style={{
                textAlign: "center",
                marginTop: 10,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "Outfit,sans-serif",
                  fontSize: 8,
                  color: "rgba(245,240,228,.22)",
                  textTransform: "uppercase",
                  letterSpacing: ".1em",
                }}
              >
                Tap to flip
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
