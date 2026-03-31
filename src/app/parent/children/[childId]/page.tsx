import { getSession } from "@/lib/auth/session";
import pool from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import type { Child, GameSession } from "@/lib/types";
import type { RowDataPacket } from "mysql2";
import ChildAnalyticsClient from "./ChildAnalyticsClient";

interface Props {
  params: Promise<{ childId: string }>;
}

export default async function ChildDetailPage({ params }: Props) {
  const { childId } = await params;
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [childRows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM children WHERE id = ? AND parent_id = ?",
    [childId, session.userId]
  );

  if (childRows.length === 0) notFound();

  const child = {
    ...childRows[0],
    avatar_config: typeof childRows[0].avatar_config === "string"
      ? JSON.parse(childRows[0].avatar_config)
      : childRows[0].avatar_config,
  } as Child;

  // Fetch recent sessions
  const [sessions] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM game_sessions WHERE child_id = ? ORDER BY started_at DESC LIMIT 20",
    [childId]
  );

  // Fetch badges
  const [badgeRows] = await pool.query<RowDataPacket[]>(
    `SELECT cb.*, b.slug, b.name, b.description, b.icon_url, b.criteria
     FROM child_badges cb
     JOIN badges b ON cb.badge_id = b.id
     WHERE cb.child_id = ?`,
    [childId]
  );

  const childBadges = badgeRows.map((cb) => ({
    child_id: cb.child_id,
    badge_id: cb.badge_id,
    earned_at: cb.earned_at,
    badge: {
      id: cb.badge_id,
      slug: cb.slug,
      name: cb.name,
      description: cb.description,
      icon_url: cb.icon_url,
      criteria: typeof cb.criteria === "string" ? JSON.parse(cb.criteria) : cb.criteria,
    },
  }));

  return (
    <ChildAnalyticsClient
      child={child}
      sessions={sessions as GameSession[]}
      childBadges={childBadges}
    />
  );
}
