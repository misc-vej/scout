import { auth } from "@/auth";
import { signOut } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import ProfilePasskeyButton from "./ProfilePasskeyButton";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const [profile] = await db
    .select({ passkeyPromptedAt: profiles.passkeyPromptedAt })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  const hasPasskey = !!profile?.passkeyPromptedAt;

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Profile</h1>

      {/* Account section */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Account
        </h2>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <p className="text-sm text-gray-700">{session.user.email}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/auth" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Sign out
            </button>
          </form>
        </div>
      </section>

      {/* Security — Passkey section */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Security
        </h2>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-800 mb-1">Passkey</p>
            <p className="text-xs text-gray-500 mb-3">
              Passkeys let you sign in with your device&apos;s biometrics instead of a password.
            </p>
            {hasPasskey ? (
              <p className="text-sm text-green-600 font-medium">
                ✓ Passkey registered — sign in with your face or fingerprint next time.
              </p>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  You haven&apos;t set up a passkey yet.
                </p>
                <ProfilePasskeyButton />
              </div>
            )}
          </div>
        </div>
      </section>

      <p className="text-xs text-gray-300 text-center">Scout · Phase 1 Foundation</p>
    </div>
  );
}
