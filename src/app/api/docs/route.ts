import { NextResponse } from "next/server";
import { docGroups } from "@/data/api-reference";

/* Statically evaluated at build time — required for `output: "export"` (GitHub Pages). */
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ groups: docGroups });
}
