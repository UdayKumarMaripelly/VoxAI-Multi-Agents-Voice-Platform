import WebSocket from "ws";

let assemblySocket = null;

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body?.audio) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  // Create AssemblyAI socket ONCE
  if (!assemblySocket || assemblySocket.readyState !== WebSocket.OPEN) {
    assemblySocket = new WebSocket(
      "wss://streaming.assemblyai.com/v3/ws",
      {
        headers: {
          Authorization: process.env.ASSEMBLY_API_KEY,
          "Sample-Rate": "16000",
        },
      }
    );

    assemblySocket.on("open", () => {
      console.log("✅ AssemblyAI connected");
    });

    assemblySocket.on("message", (msg) => {
      // Send transcript back to browser (SSE style)
      console.log("📝 Transcript:", msg.toString());
    });

    assemblySocket.on("close", () => {
      console.log("❌ AssemblyAI closed");
      assemblySocket = null;
    });
  }

  // Send raw PCM bytes
  if (assemblySocket.readyState === WebSocket.OPEN) {
    assemblySocket.send(body.audio);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

