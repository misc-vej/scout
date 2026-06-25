"use server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export async function dismissPasskeyPrompt(userId: string) {
  // Validate against session — never trust client-supplied userId for WHERE clause
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }
  await db
    .update(profiles)
    .set({ passkeyPromptedAt: new Date() })
    .where(eq(profiles.userId, session.user.id));
}
