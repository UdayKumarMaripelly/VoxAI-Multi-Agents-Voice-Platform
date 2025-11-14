import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ASSEMBLY_API_KEY;

    if (!apiKey) {
      console.error("ASSEMBLY_API_KEY not set!");
      return NextResponse.json(
        { error: "ASSEMBLY_API_KEY not set in .env.local" },
        { status: 500 }
      );
    }

    return NextResponse.json({ token: apiKey });
  } catch (err) {
    console.error("Error in /api/getToken:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

