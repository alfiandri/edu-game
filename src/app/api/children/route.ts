import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { CreateChildSchema } from "@/lib/types";
import { getAgeTier } from "@/lib/utils";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM children WHERE parent_id = ? ORDER BY created_at ASC",
      [session.userId]
    );

    // Parse avatar_config JSON for each child
    const children = rows.map((r) => ({
      ...r,
      avatar_config: typeof r.avatar_config === "string" ? JSON.parse(r.avatar_config) : r.avatar_config,
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Get children error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = CreateChildSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { display_name, date_of_birth } = result.data;
    const ageTier = getAgeTier(new Date(date_of_birth));
    const id = crypto.randomUUID();

    await pool.query(
      `INSERT INTO children (id, parent_id, display_name, date_of_birth, age_tier, xp_total, currency_balance, current_streak, longest_streak) 
       VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0)`,
      [id, session.userId, display_name, date_of_birth, ageTier]
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Create child error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
