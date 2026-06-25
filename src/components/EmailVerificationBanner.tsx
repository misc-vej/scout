"use client";
import { useState } from "react";

interface EmailVerificationBannerProps {
  emailVerified: Date | null;
}

export default function EmailVerificationBanner({
  emailVerified,
}: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (emailVerified || dismissed) return null;

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-sm text-amber-800">
      <span>
        Check your inbox — click the link we sent to verify your account.
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="flex-shrink-0 text-amber-600 hover:text-amber-800 font-medium text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
