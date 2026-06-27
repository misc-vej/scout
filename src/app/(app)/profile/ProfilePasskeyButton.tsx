"use client";

export default function ProfilePasskeyButton() {
  return (
    <button
      onClick={() =>
        alert("Passkey setup: sign in with email/password once, then your device will offer to save it as a passkey for future logins.")
      }
      type="button"
      style={{
        background: "#2a7a48",
        color: "#f5f0e4",
        border: "none",
        borderRadius: 10,
        padding: "10px 20px",
        fontFamily: "Outfit,sans-serif",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Set up passkey
    </button>
  );
}
