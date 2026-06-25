"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import PasskeyPrompt from "@/components/PasskeyPrompt";

interface HomeClientProps {
  userId: string;
  email: string;
  showPasskeyPrompt: boolean;
}

export default function HomeClient({ userId, email, showPasskeyPrompt }: HomeClientProps) {
  const [promptVisible, setPromptVisible] = useState(showPasskeyPrompt);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {promptVisible && (
        <PasskeyPrompt userId={userId} onDismiss={() => setPromptVisible(false)} />
      )}
      <h1 className="text-4xl font-bold text-green-500 mb-2">Scout</h1>
      <p className="text-gray-600 mb-1">Welcome, {email}</p>
      <p className="text-gray-400 text-sm mb-8">
        Your beastiary is coming — go find something.
      </p>
      <button
        onClick={() => signOut({ callbackUrl: "/auth" })}
        className="text-sm text-gray-500 underline hover:text-gray-700"
      >
        Sign out
      </button>
    </div>
  );
}
