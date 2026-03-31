import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { RegisterSchema } from "@/lib/types";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { email, password, display_name } = result.data;

    // Check if email already exists
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM parents WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      "INSERT INTO parents (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
      [id, email, passwordHash, display_name]
    );

    const token = await createSession({ userId: id, email });
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
