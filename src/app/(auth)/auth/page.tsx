"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { registerUser } from "./actions";

declare global {
  interface Window {
    PasswordCredential?: new (data: PasswordCredentialData) => PasswordCredential;
  }
  interface PasswordCredential extends Credential {
    readonly password: string | null;
  }
  interface PasswordCredentialData {
    id: string;
    password: string;
    name?: string;
  }
}

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"email" | "passkey">("email");

  async function handlePasskeySignIn() {
    if (typeof window === "undefined") return;
    try {
      setLoading(true);
      setError(null);
      // Use browser Credential Management API — triggers native Face ID / password manager
      const cred = await navigator.credentials.get({
        password: true,
        mediation: "required",
      } as CredentialRequestOptions);
      if (cred && "password" in cred) {
        const pc = cred as PasswordCredential;
        const result = await signIn("credentials", {
          email: pc.id,
          password: pc.password ?? "",
          redirect: false,
        });
        if (result?.ok) {
          window.location.href = "/home";
        } else {
          setError("Credentials not recognised. Try signing in with email.");
          setMode("email");
        }
      } else {
        setMode("email");
      }
    } catch {
      setMode("email");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        await registerUser(email, password);
      } else if (result?.ok) {
        // Save credential to browser manager (enables Face ID on future visits)
        if (typeof window !== "undefined" && window.PasswordCredential) {
          try {
            const cred = new window.PasswordCredential({ id: email, password } as PasswordCredentialData);
            await navigator.credentials.store(cred);
          } catch { /* non-fatal */ }
        }
        window.location.href = "/home";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f0e4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Outfit, sans-serif",
        padding: "0 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* SCOUT animated wordmark */}
        <div style={{ marginBottom: 8, animation: "scout-appear 0.7s cubic-bezier(.22,.68,0,1.2) forwards" }}>
          <div
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 30,
              fontWeight: 800,
              color: "#1c2e1e",
              letterSpacing: ".04em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            Scout
          </div>
        </div>
        {/* Tagline */}
        <p
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 12,
            color: "#6a9a78",
            marginBottom: 28,
            animation: "fade-up 0.5s 0.25s ease both",
          }}
        >
          Find something wild.
        </p>

        {/* Passkey / biometric sign-in button */}
        <div style={{ animation: "fade-up 0.5s 0.35s ease both", marginBottom: 16 }}>
          <button
            type="button"
            onClick={handlePasskeySignIn}
            disabled={loading}
            style={{
              width: "100%",
              borderRadius: 12,
              background: "#1c2e1e",
              color: "#f5f0e4",
              padding: "13px 24px",
              fontFamily: "Outfit, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="#f5f0e4" strokeWidth="1.8"/>
              <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" stroke="#f5f0e4" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Sign in with passkey
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 16,
            animation: "fade-up 0.5s 0.4s ease both",
          }}
        >
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(28,46,30,.1)" }} />
          <span style={{ fontSize: 12, color: "#a0b8a0" }}>or use email</span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid rgba(28,46,30,.1)" }} />
        </div>

        {/* Email / password form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fade-up 0.5s 0.45s ease both" }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1px solid rgba(28,46,30,.15)",
              background: "#e8d8c0",
              padding: "12px 16px",
              fontFamily: "Outfit, sans-serif",
              fontSize: 14,
              color: "#1c2e1e",
              outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1px solid rgba(28,46,30,.15)",
              background: "#e8d8c0",
              padding: "12px 16px",
              fontFamily: "Outfit, sans-serif",
              fontSize: 14,
              color: "#1c2e1e",
              outline: "none",
            }}
          />
          {error && (
            <p style={{ fontSize: 12, color: "#c84040", margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              borderRadius: 12,
              background: "#2a7a48",
              color: "#f5f0e4",
              padding: "13px 24px",
              fontFamily: "Outfit, sans-serif",
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              marginTop: 4,
            }}
          >
            {loading ? "Loading…" : "Continue"}
          </button>
        </form>

      </div>
    </div>
  );
}
