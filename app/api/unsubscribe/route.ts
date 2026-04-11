import { NextRequest, NextResponse } from "next/server";
import { hasDatabaseUrl, getSql } from "@/lib/server/db";

export async function POST(req: NextRequest) {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: false, error: "no db" }, { status: 503 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });
  }

  const sql = getSql();
  const result = await sql`
    update users
    set email_opt_out = true
    where email = ${email.toLowerCase().trim()}
  `;

  if (result.count === 0) {
    // Email not found — still return ok so we don't leak user existence
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
