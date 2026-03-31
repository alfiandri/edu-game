import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import type { RowDataPacket } from "mysql2";

interface RouteParams {
  params: Promise<{ childId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { childId } = await params;

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM children WHERE id = ? AND parent_id = ?",
      [childId, session.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    const child = {
      ...rows[0],
      avatar_config: typeof rows[0].avatar_config === "string" ? JSON.parse(rows[0].avatar_config) : rows[0].avatar_config,
    };

    // Fetch recent sessions
    const [sessions] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM game_sessions WHERE child_id = ? ORDER BY started_at DESC LIMIT 20",
      [childId]
    );

    // Fetch badges
    const [childBadges] = await pool.query<RowDataPacket[]>(
      `SELECT cb.*, b.slug, b.name, b.description, b.icon_url, b.criteria 
       FROM child_badges cb 
       JOIN badges b ON cb.badge_id = b.id 
       WHERE cb.child_id = ?`,
      [childId]
    );

    const formattedBadges = childBadges.map((cb) => ({
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

    return NextResponse.json({ child, sessions, childBadges: formattedBadges });
  } catch (error) {
    console.error("Get child error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
