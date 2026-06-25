import { auth } from "@/auth";
import { signOut } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-green-500 mb-2">Scout</h1>
      <p className="text-gray-600 mb-1">Welcome, {session?.user?.email}</p>
      <p className="text-gray-400 text-sm mb-8">Your beastiary is coming — go find something.</p>
      <form action={async () => {
        "use server";
        await signOut({ redirectTo: "/auth" });
      }}>
        <button type="submit" className="text-sm text-gray-500 underline hover:text-gray-700">
          Sign out
        </button>
      </form>
    </div>
  );
}
