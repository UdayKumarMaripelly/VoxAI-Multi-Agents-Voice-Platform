import OpenAI from "openai";
import { CoachingOptions } from "@/services/Options";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_OPENROUTER_KEY, // SERVER ONLY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { coachingOption, conversation } = body;

    // ✅ Filter meaningful conversation (CRITICAL)
    const meaningfulConversation = Array.isArray(conversation)
      ? conversation.filter(
          (c) => c?.role && c?.content && c.content.trim() !== ""
        )
      : [];

    // ✅ Validate input AFTER filtering
    if (!coachingOption || meaningfulConversation.length < 2) {
      return Response.json(
        { error: "Not enough meaningful conversation to generate feedback" },
        { status: 400 }
      );
    }

    const option = CoachingOptions.find(
      (o) => o.name === coachingOption
    );

    if (!option) {
      return Response.json(
        { error: "Invalid coaching option" },
        { status: 400 }
      );
    }

    // ✅ Build conversation text
    const conversationText = meaningfulConversation
      .map((c) => `${c.role.toUpperCase()}: ${c.content}`)
      .join("\n");

    const prompt = `
${option.summeryPrompt}

Conversation:
${conversationText}
    `.trim();

    // 🔍 Debug logs (keep for now)
    console.log("🧠 Coaching option:", coachingOption);
    console.log("💬 Messages:", meaningfulConversation.length);
    console.log("📏 Prompt length:", prompt.length);

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result =
      completion?.choices?.[0]?.message?.content?.trim();

    // ✅ Validate AI response
    if (!result) {
      console.error("❌ Empty AI response:", completion);
      return Response.json(
        { error: "AI failed to generate feedback" },
        { status: 500 }
      );
    }

    return Response.json({ result });

  } catch (err) {
    console.error("❌ Feedback API error:", err);
    return Response.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}






