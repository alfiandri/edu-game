import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Child } from "@/lib/types";

export default async function ParentDashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true });

  const childList = (children || []) as Child[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Parent Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Track your children&apos;s learning progress
          </p>
        </div>
        <Link
          href="/parent/children/new"
          className="px-6 py-3 rounded-2xl font-bold bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          + Add Child
        </Link>
      </div>

      {childList.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-7xl block mb-4">👶</span>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No children added yet
          </h2>
          <p className="text-gray-500 mb-6">
            Add your child&apos;s profile to start their learning adventure!
          </p>
          <Link
            href="/parent/children/new"
            className="inline-block px-8 py-3 rounded-2xl font-bold bg-gradient-to-b from-purple-500 to-purple-700 text-white shadow-lg"
          >
            Add Your First Child 🚀
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {childList.map((child) => (
            <Link
              key={child.id}
              href={`/parent/children/${child.id}`}
              className="group block"
            >
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:border-purple-200 transition-all group-hover:scale-[1.02]">
                {/* Avatar */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl text-white font-bold shadow-md">
                    {child.display_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {child.display_name}
                    </h3>
                    <span className="text-sm text-gray-400 capitalize">
                      {child.age_tier.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-xl bg-purple-50">
                    <p className="text-lg font-bold text-purple-600">
                      {child.xp_total}
                    </p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-orange-50">
                    <p className="text-lg font-bold text-orange-600">
                      {child.current_streak}
                    </p>
                    <p className="text-xs text-gray-500">
                      🔥 Streak
                    </p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-yellow-50">
                    <p className="text-lg font-bold text-yellow-600">
                      {child.currency_balance}
                    </p>
                    <p className="text-xs text-gray-500">🪙 Coins</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
