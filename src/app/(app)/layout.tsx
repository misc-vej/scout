import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NavShell from "@/components/NavShell";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const [user] = await db
    .select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return (
    <QueryProvider>
      <EmailVerificationBanner emailVerified={user?.emailVerified ?? null} />
      <NavShell>{children}</NavShell>
    </QueryProvider>
  );
}
