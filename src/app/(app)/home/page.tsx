import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const [profile] = await db
    .select({ passkeyPromptedAt: profiles.passkeyPromptedAt })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  const showPasskeyPrompt = !profile?.passkeyPromptedAt;

  return (
    <HomeClient
      userId={session.user.id}
      email={session.user.email ?? ""}
      showPasskeyPrompt={showPasskeyPrompt}
    />
  );
}
