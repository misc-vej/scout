import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NavShell from "@/components/NavShell";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PledgeModal } from "@/components/auth/PledgeModal";

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

  const [profile] = await db
    .select({ pledgeAcceptedAt: profiles.pledgeAcceptedAt })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);
  const pledgeAccepted = !!(profile?.pledgeAcceptedAt);

  return (
    <QueryProvider>
      {!pledgeAccepted && <PledgeModal />}
      <EmailVerificationBanner emailVerified={user?.emailVerified ?? null} />
      <NavShell>{children}</NavShell>
    </QueryProvider>
  );
}
