import { NextResponse } from "next/server";
import { contributionsData } from "@/data/contributions";

export async function GET() {
  return NextResponse.json(contributionsData);
}
