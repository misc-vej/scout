"use client";
import { useState } from "react";
import { dismissPasskeyPrompt } from "@/app/(app)/home/actions";

interface PasskeyPromptProps {
  userId: string;
  onDismiss: () => void;
}

export default function PasskeyPrompt({ userId, onDismiss }: PasskeyPromptProps) {
  const [loading, setLoading] = useState(false);

  async function handleDismiss() {
    setLoading(true);
    await dismissPasskeyPrompt(userId);
    onDismiss();
  }

  async function handleSetup() {
    setLoading(true);
    await dismissPasskeyPrompt(userId);
    alert("Passkey setup will be available in the next update — you're already signed in!");
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Sign in with your face or fingerprint next time
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Set up a passkey so you can log in without typing a password — just a quick biometric check.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-green-500 text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            Set up passkey
          </button>
          <button
            onClick={handleDismiss}
            disabled={loading}
            className="w-full text-gray-500 text-sm hover:text-gray-700 py-2"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
