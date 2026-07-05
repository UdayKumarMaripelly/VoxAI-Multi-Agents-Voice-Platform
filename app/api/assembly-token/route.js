import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    token: process.env.ASSEMBLY_API_KEY,
  });
}
