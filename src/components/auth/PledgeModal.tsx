'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function PledgeModal() {
  const [accepted, setAccepted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/pledge/accept', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to record pledge');
      return res.json();
    },
    onSuccess: () => setAccepted(true),
  });

  if (accepted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.85)", backdropFilter: "blur(4px)" }}
    >
      <div
        style={{
          background: "#f5f0e4",
          border: "1px solid rgba(42,122,72,.12)",
          borderRadius: 18,
          padding: 32,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,.6)",
        }}
      >
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: "#1c2e1e",
            textTransform: "uppercase",
            letterSpacing: ".04em",
            marginBottom: 4,
            margin: 0,
          }}
        >
          The Scout&apos;s Pledge
        </h2>
        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 13,
            color: "#6a9a78",
            marginBottom: 24,
            lineHeight: 1.6,
            marginTop: 4,
          }}
        >
          Before you start collecting, please commit to responsible spotting.
        </p>
        <div
          style={{
            background: "rgba(42,122,72,.05)",
            border: "1px solid rgba(42,122,72,.08)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 13,
              color: "#2a7a48",
              lineHeight: 1.7,
            }}
          >
            I promise to observe wildlife without disturbing it. I will keep a safe distance,
            never touch nests or young, stay on paths, and follow the Wildlife &amp; Countryside
            Act 1981. If I see something rare, I&apos;ll keep the location to myself.
          </span>
        </div>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          style={{
            background: "#2a7a48",
            color: "#f5f0e4",
            borderRadius: 14,
            padding: "14px 0",
            width: "100%",
            fontFamily: "Syne, sans-serif",
            fontSize: 15,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            border: "none",
            cursor: mutation.isPending ? "default" : "pointer",
            opacity: mutation.isPending ? 0.5 : 1,
          }}
        >
          {mutation.isPending ? 'Saving…' : 'I Accept the Pledge'}
        </button>
      </div>
    </div>
  );
}
