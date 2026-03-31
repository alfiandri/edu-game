"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useChildStore } from "@/stores/child-store";
import type { Child } from "@/lib/types";
import { motion } from "framer-motion";

export default function SelectChildPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const { setSelectedChild, setChildren: setStoreChildren } = useChildStore();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at");
      setChildren((data || []) as Child[]);
      setStoreChildren((data || []) as Child[]);
      setLoading(false);
    }
    load();
  }, [router, setStoreChildren]);

  const selectChild = (child: Child) => {
    setSelectedChild(child);
    // Set cookie for middleware
    document.cookie = `selected_child_id=${child.id}; path=/; max-age=${60 * 60 * 4}`; // 4 hours
    router.push("/play");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🎮</div>
          <p className="text-lg font-bold text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 px-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <span className="text-6xl block mb-4">🎮</span>
          <h1 className="text-3xl font-bold text-gray-800">Who&apos;s Playing?</h1>
          <p className="text-gray-500 mt-2">Choose a player to start!</p>
        </div>

        {children.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-500 mb-4">No children added yet.</p>
            <button
              onClick={() => router.push("/parent/children/new")}
              className="px-8 py-3 rounded-2xl font-bold bg-purple-600 text-white"
            >
              Add a Child First
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {children.map((child, i) => (
              <motion.button
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectChild(child)}
                className="flex items-center gap-4 p-6 rounded-3xl bg-white shadow-lg border-2 border-transparent hover:border-purple-300 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-3xl text-white font-bold shadow-md">
                  {child.display_name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-xl font-bold text-gray-800">
                    {child.display_name}
                  </h3>
                  <p className="text-sm text-gray-400 capitalize">
                    {child.age_tier.replace("_", " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">
                    {child.xp_total} XP
                  </p>
                  <p className="text-sm text-orange-500">
                    🔥 {child.current_streak}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
