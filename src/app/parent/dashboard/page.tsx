import { getSession } from "@/lib/auth/session";
import pool from "@/lib/db";
import { redirect } from "next/navigation";
import type { Child } from "@/lib/types";
import type { RowDataPacket } from "mysql2";
import DashboardClient from "./DashboardClient";

export default async function ParentDashboard() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM children WHERE parent_id = ? ORDER BY created_at ASC",
    [session.userId]
  );

  const childList = rows.map((r) => ({
    ...r,
    avatar_config: typeof r.avatar_config === "string" ? JSON.parse(r.avatar_config) : r.avatar_config,
  })) as Child[];

  return <DashboardClient childList={childList} />;
}
