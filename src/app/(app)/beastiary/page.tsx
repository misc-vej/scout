import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function BeastiaryPage() {
  const session = await auth();
  if (!session) redirect("/auth");

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Beastiary</h1>
      <p className="text-gray-500 text-sm mb-8">
        Your collection lives here. Go spot something to fill your first card.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center"
          >
            <span className="text-gray-300 text-2xl">?</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-300 text-center mt-8">
        Species cards unlock as you spot wildlife
      </p>
    </div>
  );
}
