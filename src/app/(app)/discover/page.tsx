import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DiscoverPage() {
  const session = await auth();
  if (!session) redirect("/auth");

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Discover</h1>
      <p className="text-gray-500 text-sm mb-8">
        What&apos;s near you? Location-based discovery is coming — your local wildlife is waiting.
      </p>
      <div className="flex items-center justify-center">
        <div className="w-48 h-48 rounded-full bg-green-50 border-2 border-green-100 flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">🧭</span>
          <span className="text-xs text-green-400 font-medium">Coming soon</span>
        </div>
      </div>
      <p className="text-xs text-gray-300 text-center mt-8">
        GPS discovery activates in a future update
      </p>
    </div>
  );
}
