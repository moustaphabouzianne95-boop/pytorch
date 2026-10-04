import { NextResponse } from "next/server";
import { lessons } from "@/data/lessons";

/* Statically evaluated at build time — required for `output: "export"` (GitHub Pages). */
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ lessons });
}
