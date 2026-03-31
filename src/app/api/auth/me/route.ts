import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import pool from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, display_name, created_at FROM parents WHERE id = ?",
      [session.userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: rows[0] });
  } catch {
    return NextResponse.json({ user: null });
  }
}
