"use client";

import { useEffect, useState } from "react";

type QueueItem = {
  id: string;
  evidenceType: string;
  evidenceData: string | null;
  submittedAt: string;
  submitterName: string | null;
  submitterEmail: string;
  speciesName: string;
  scientificName: string;
  rarityTier: string;
  speciesType: string | null;
};

export function VerificationQueue() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/verify/queue")
      .then(r => r.json())
      .then(d => setItems(d.queue ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function resolve(id: string, decision: "approved" | "rejected") {
    setResolving(id);
    try {
      const res = await fetch(`/api/verify/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, reviewNote: note[id] ?? "" }),
      });
      if (res.ok) {
        setResolved(prev => new Set([...prev, id]));
      }
    } finally {
      setResolving(null);
    }
  }

  const pending = items.filter(i => !resolved.has(i.id));

  if (loading) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center" }}>
        <div style={{ width: 20, height: 20, border: "2px solid rgba(42,122,72,.15)", borderTopColor: "#2a7a48", borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto" }} />
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div style={{ background: "#e8d8c0", borderRadius: 14, padding: "16px 18px", textAlign: "center" }}>
        <div style={{ fontSize: 22, marginBottom: 6 }}>🌿</div>
        <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "#6a9a78" }}>
          No spots waiting for review right now.
        </div>
        <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#a0b8a0", marginTop: 4 }}>
          Check back after other scouts submit their sightings.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {pending.map(item => (
        <div key={item.id} style={{ background: "#e8d8c0", borderRadius: 14, overflow: "hidden" }}>
          {/* Evidence */}
          {item.evidenceType === "photo" && item.evidenceData ? (
            <div style={{ width: "100%", height: 160, overflow: "hidden", position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.evidenceData}
                alt="Sighting evidence"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : (
            <div style={{ padding: "14px 16px 0" }}>
              <div style={{ background: "rgba(28,46,30,.06)", borderRadius: 10, padding: "10px 12px", fontFamily: "Outfit,sans-serif", fontSize: 12, color: "#1c2e1e", fontStyle: "italic", lineHeight: 1.5 }}>
                &ldquo;{item.evidenceData}&rdquo;
              </div>
            </div>
          )}

          {/* Meta */}
          <div style={{ padding: "12px 16px 4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div>
                <div style={{ fontFamily: "Syne,sans-serif", fontSize: 14, fontWeight: 800, color: "#1c2e1e" }}>{item.speciesName}</div>
                <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, color: "#6a9a78", fontStyle: "italic" }}>{item.scientificName}</div>
              </div>
              <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 10, color: "#a0b8a0", textAlign: "right" }}>
                {item.submitterName ?? item.submitterEmail.split("@")[0]}<br/>
                {new Date(item.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </div>
            </div>

            <textarea
              placeholder="Optional note to spotter…"
              value={note[item.id] ?? ""}
              onChange={e => setNote(prev => ({ ...prev, [item.id]: e.target.value }))}
              rows={2}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: 8,
                border: "1.5px solid rgba(28,46,30,.1)", background: "rgba(255,255,255,.6)",
                fontFamily: "Outfit,sans-serif", fontSize: 11, color: "#1c2e1e",
                resize: "none", boxSizing: "border-box", marginBottom: 10,
              }}
            />

            <div style={{ display: "flex", gap: 8, paddingBottom: 14 }}>
              <button
                onClick={() => resolve(item.id, "approved")}
                disabled={resolving === item.id}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer",
                  background: "#2a7a48", border: "none",
                  fontFamily: "Outfit,sans-serif", fontSize: 12, fontWeight: 700, color: "#f5f0e4",
                  opacity: resolving === item.id ? 0.5 : 1,
                }}
              >
                ✓ Verify
              </button>
              <button
                onClick={() => resolve(item.id, "rejected")}
                disabled={resolving === item.id}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 10, cursor: "pointer",
                  background: "rgba(200,96,48,.08)", border: "1.5px solid rgba(200,96,48,.25)",
                  fontFamily: "Outfit,sans-serif", fontSize: 12, fontWeight: 700, color: "#c86030",
                  opacity: resolving === item.id ? 0.5 : 1,
                }}
              >
                ✗ Not valid
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
