import { NextResponse } from "next/server";
import { lessons } from "@/data/lessons";

export async function GET() {
  return NextResponse.json({ lessons });
}
