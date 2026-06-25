"use client";

export default function ProfilePasskeyButton() {
  return (
    <button
      onClick={() =>
        alert("Passkey setup will be available in the next update — you're already signed in!")
      }
      className="bg-green-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-600 transition-colors"
      type="button"
    >
      Set up passkey
    </button>
  );
}
