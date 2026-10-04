import { NextResponse } from "next/server";
import { docGroups } from "@/data/api-reference";

export async function GET() {
  return NextResponse.json({ groups: docGroups });
}
