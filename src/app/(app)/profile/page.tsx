import { auth } from "@/auth";
import { signOut } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { collections, profiles, species, userBadges } from "@/lib/db/schema";
import { count, eq, and } from "drizzle-orm";
import ProfilePasskeyButton from "./ProfilePasskeyButton";
import { BADGE_REGISTRY, BADGE_CATEGORY_COLOR } from "@/lib/badges";
import { VerificationQueue } from "@/components/profile/VerificationQueue";

// ─── Rewards tiers (based on verified spot count) ────────────────────────────

const REWARDS = [
  { threshold: 10,   icon: "🌿", name: "Trusted Scout",      description: "Digital merit badge unlocked in your profile" },
  { threshold: 25,   icon: "📰", name: "Field Notes",         description: "Monthly wildlife sighting newsletter" },
  { threshold: 50,   icon: "🔔", name: "Priority Alerts",     description: "Rare species alerts for your grid squares" },
  { threshold: 100,  icon: "🎟️", name: "Trust Discount",      description: "10% off at English Trust gift shops" },
  { threshold: 200,  icon: "☕", name: "Free Coffee",          description: "Complimentary drink at any participating Trust café" },
  { threshold: 500,  icon: "🌳", name: "Reserve Day Pass",    description: "Free family day entry to a Trust nature reserve" },
  { threshold: 1000, icon: "🎫", name: "Full Membership",      description: "One-year English Trust membership" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const [profile] = await db
    .select({ passkeyPromptedAt: profiles.passkeyPromptedAt })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  const [[collectedRow], [verifiedRow], [pendingRow], [totalRow], earnedBadgeRows] = await Promise.all([
    db.select({ count: count() }).from(collections).where(eq(collections.userId, session.user.id)),
    db.select({ count: count() }).from(collections).where(and(eq(collections.userId, session.user.id), eq(collections.verificationStatus, "verified"))),
    db.select({ count: count() }).from(collections).where(and(eq(collections.userId, session.user.id), eq(collections.verificationStatus, "pending"))),
    db.select({ count: count() }).from(species),
    db.select({ slug: userBadges.slug }).from(userBadges).where(eq(userBadges.userId, session.user.id)),
  ]);

  const totalCollected = Number(collectedRow?.count ?? 0);
  const verifiedCount = Number(verifiedRow?.count ?? 0);
  const pendingCount = Number(pendingRow?.count ?? 0);
  const totalSpecies = Number(totalRow?.count ?? 0);
  const collectedPct = totalSpecies > 0 ? Math.round((totalCollected / totalSpecies) * 100) : 0;
  const verifiedPct = totalSpecies > 0 ? Math.round((verifiedCount / totalSpecies) * 100) : 0;

  const hasPasskey = !!profile?.passkeyPromptedAt;
  const earnedSlugs = new Set(earnedBadgeRows.map(r => r.slug));
  const earnedCount = earnedSlugs.size;

  // Next reward milestone
  const nextReward = REWARDS.find(r => r.threshold > verifiedCount);
  const spotsToNextReward = nextReward ? nextReward.threshold - verifiedCount : 0;

  return (
    <div style={{ maxWidth: 390, margin: "0 auto", padding: "32px 24px 100px", fontFamily: "Outfit,sans-serif" }}>

      {/* ── Collection progress ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#6a9a78", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
          Collection
        </div>
        <div style={{ background: "#e8d8c0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span style={{ fontFamily: "Syne,sans-serif", fontSize: 22, fontWeight: 800, color: "#1c2e1e" }}>
              {totalCollected}
              <span style={{ fontSize: 14, fontWeight: 400, color: "#6a9a78", marginLeft: 4 }}>/ {totalSpecies}</span>
            </span>
            <span style={{ fontSize: 12, color: "#6a9a78" }}>{collectedPct}% collected</span>
          </div>
          {/* Collected bar */}
          <div style={{ background: "rgba(28,46,30,.1)", borderRadius: 6, height: 6, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ background: "rgba(42,122,72,.35)", height: "100%", width: `${collectedPct}%`, borderRadius: 6 }} />
          </div>
          {/* Verified overlay */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ flex: 1, background: "rgba(28,46,30,.07)", borderRadius: 6, height: 6, overflow: "hidden" }}>
              <div style={{ background: "#2a7a48", height: "100%", width: `${verifiedPct}%`, borderRadius: 6, transition: "width .4s ease" }} />
            </div>
            <span style={{ fontSize: 10, color: "#2a7a48", fontWeight: 700, whiteSpace: "nowrap" }}>
              {verifiedCount} verified
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#a0b8a0" }}>
            {pendingCount > 0 && <span>{pendingCount} awaiting review</span>}
            {nextReward && (
              <span style={{ color: "#c8922a" }}>
                {spotsToNextReward} more to {nextReward.icon} {nextReward.name}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Rewards ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#6a9a78", textTransform: "uppercase", letterSpacing: ".1em" }}>
            Rewards
          </div>
          <div style={{ fontSize: 10, color: "#a0b8a0" }}>based on verified spots</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "#e8d8c0", borderRadius: 14, overflow: "hidden" }}>
          {REWARDS.map((reward, i) => {
            const unlocked = verifiedCount >= reward.threshold;
            const isNext = nextReward?.threshold === reward.threshold;
            const progress = Math.min(verifiedCount / reward.threshold, 1);
            return (
              <div
                key={reward.threshold}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < REWARDS.length - 1 ? "1px solid rgba(28,46,30,.06)" : "none",
                  background: unlocked ? "rgba(42,122,72,.05)" : isNext ? "rgba(200,146,42,.04)" : "transparent",
                  opacity: unlocked ? 1 : isNext ? 1 : 0.55,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: unlocked ? "#2a7a48" : isNext ? "rgba(200,146,42,.12)" : "rgba(28,46,30,.06)",
                  border: `2px solid ${unlocked ? "#2a7a48" : isNext ? "#c8922a" : "rgba(28,46,30,.1)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0, position: "relative",
                }}>
                  {reward.icon}
                  {unlocked && (
                    <div style={{
                      position: "absolute", bottom: -2, right: -2,
                      width: 14, height: 14, borderRadius: "50%",
                      background: "#2a7a48", border: "2px solid #e8d8c0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 7, color: "#fff", fontWeight: 900 }}>✓</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                    <div style={{ fontFamily: "Syne,sans-serif", fontSize: 12, fontWeight: 700, color: "#1c2e1e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {reward.name}
                    </div>
                    <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 9, color: unlocked ? "#2a7a48" : "#a0b8a0", fontWeight: 600, whiteSpace: "nowrap", marginLeft: 6 }}>
                      {unlocked ? "Unlocked" : `${reward.threshold} verified`}
                    </div>
                  </div>
                  <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, color: "#6a9a78", marginBottom: isNext && !unlocked ? 5 : 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {reward.description}
                  </div>
                  {isNext && !unlocked && (
                    <div style={{ background: "rgba(28,46,30,.08)", borderRadius: 4, height: 3, overflow: "hidden" }}>
                      <div style={{ background: "#c8922a", height: "100%", width: `${Math.round(progress * 100)}%`, borderRadius: 4, transition: "width .4s" }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, color: "#a0b8a0", marginTop: 8, textAlign: "center" }}>
          Rewards redeemable at participating English Trust locations
        </div>
      </section>

      {/* ── Badges ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#6a9a78", textTransform: "uppercase", letterSpacing: ".1em" }}>
            Badges
          </div>
          <div style={{ fontSize: 10, color: "#a0b8a0" }}>
            {earnedCount} / {BADGE_REGISTRY.length} earned
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {BADGE_REGISTRY.map((badge) => {
            const earned = earnedSlugs.has(badge.slug);
            const color = BADGE_CATEGORY_COLOR[badge.category];
            return (
              <div key={badge.slug} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div
                  title={badge.description}
                  style={{
                    width: 64, height: 64, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26,
                    background: earned ? `${color}18` : "rgba(28,46,30,.04)",
                    border: `2.5px solid ${earned ? color : "rgba(28,46,30,.1)"}`,
                    boxShadow: earned ? `0 0 0 1px ${color}22, 0 2px 8px ${color}18` : "none",
                    opacity: earned ? 1 : 0.38,
                    transition: "all .2s",
                  }}
                >
                  {badge.icon}
                </div>
                <div style={{
                  fontSize: 7.5, fontWeight: 700,
                  color: earned ? "#1c2e1e" : "#a0b8a0",
                  textTransform: "uppercase", letterSpacing: ".04em",
                  textAlign: "center", lineHeight: 1.2, maxWidth: 62,
                }}>
                  {badge.name}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Community verification queue ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#6a9a78", textTransform: "uppercase", letterSpacing: ".1em" }}>
            Verify Spots
          </div>
          <div style={{ fontSize: 10, color: "#a0b8a0" }}>help fellow scouts</div>
        </div>
        <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#6a9a78", marginBottom: 12 }}>
          Review sightings submitted by other naturalists. Your approval counts — each verified spot earns them progress towards badges and rewards.
        </div>
        <VerificationQueue />
      </section>

      {/* ── Account ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#6a9a78", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
          Account
        </div>
        <div style={{ background: "#e8d8c0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 14, color: "#1c2e1e", marginBottom: 14 }}>
            {session.user.email}
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/auth" });
            }}
          >
            <button
              type="submit"
              style={{ background: "#1c2e1e", color: "#f5f0e4", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "Outfit,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </section>

      {/* ── Security ── */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#6a9a78", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
          Security
        </div>
        <div style={{ background: "#e8d8c0", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1c2e1e", marginBottom: 4 }}>Passkey</div>
          <div style={{ fontSize: 12, color: "#6a9a78", marginBottom: 12 }}>
            Sign in with your device&apos;s biometrics instead of a password.
          </div>
          {hasPasskey ? (
            <div style={{ fontSize: 13, color: "#2a7a48", fontWeight: 500 }}>✓ Passkey registered</div>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: "#6a9a78", marginBottom: 12 }}>
                You haven&apos;t set up a passkey yet.
              </div>
              <ProfilePasskeyButton />
            </div>
          )}
        </div>
      </section>

      <div style={{ fontSize: 11, color: "rgba(28,46,30,.25)", textAlign: "center", marginTop: 24 }}>
        Scout · Field Guide
      </div>
    </div>
  );
}
