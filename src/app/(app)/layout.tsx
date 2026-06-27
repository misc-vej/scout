import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import NavShell from "@/components/NavShell";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { PledgeModal } from "@/components/auth/PledgeModal";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth");

  const [profile] = await db
    .select({ pledgeAcceptedAt: profiles.pledgeAcceptedAt })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);
  const pledgeAccepted = !!(profile?.pledgeAcceptedAt);
  const userInitial = (session.user.name?.[0] ?? session.user.email?.[0] ?? "?").toUpperCase();

  return (
    <QueryProvider>
      {!pledgeAccepted && <PledgeModal />}
      <NavShell userInitial={userInitial}>{children}</NavShell>
    </QueryProvider>
  );
}
