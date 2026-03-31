import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: parent } = await supabase
    .from("parents")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Parent Nav */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/parent/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <span className="text-xl font-bold text-purple-700">EduGame</span>
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <Link
                href="/parent/dashboard"
                className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/parent/children/new"
                className="text-sm font-semibold text-gray-600 hover:text-purple-600 transition-colors"
              >
                Add Child
              </Link>
              <Link
                href="/play/select-child"
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                ▶ Play Mode
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              👋 {parent?.display_name || user.email}
            </span>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-400 hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
