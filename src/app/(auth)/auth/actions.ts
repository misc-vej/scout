"use server";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { eq } from "drizzle-orm";

export async function registerUser(email: string, password: string) {
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) throw new Error("Email already registered");
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(users).values({ email, passwordHash }).returning();
  await db.insert(profiles).values({ userId: user.id });
  await signIn("credentials", { email, password, redirectTo: "/home" });
}
