import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import pool from "@/lib/db";
import ParentNav from "@/components/ui/ParentNav";
import type { RowDataPacket } from "mysql2";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT display_name FROM parents WHERE id = ?",
    [session.userId]
  );

  const displayName = rows[0]?.display_name || session.email || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <ParentNav displayName={displayName} />
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
