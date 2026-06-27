"use client";
import { signOut } from "next-auth/react";

interface HomeClientProps {
  userId: string;
  email: string;
  showPasskeyPrompt: boolean;
}

export default function HomeClient({ email }: HomeClientProps) {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f0e4",
        fontFamily: "Outfit, sans-serif",
        padding: "0 32px",
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: 42,
          fontWeight: 800,
          color: "#1c2e1e",
          letterSpacing: ".06em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Scout
      </div>
      <p style={{ fontSize: 14, color: "#1c2e1e", marginBottom: 4 }}>
        Welcome, {email}
      </p>
      <p style={{ fontSize: 12, color: "#6a9a78", marginBottom: 32 }}>
        Head to Nearby or your Logbook to get started.
      </p>
      <button
        onClick={() => signOut({ callbackUrl: "/auth" })}
        style={{
          fontSize: 12,
          color: "#a0b8a0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        Sign out
      </button>
    </div>
  );
}
