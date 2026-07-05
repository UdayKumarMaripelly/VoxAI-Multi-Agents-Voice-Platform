import OpenAI from "openai";
import { CoachingOptions } from "./Options";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

/**
 * ⚠️ TEMPORARY client-side AI (for live chat only)
 * Move to server ASAP for production
 */
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser: true,
});

// =====================
// AI CHAT RESPONSE
// =====================
export const AIModel = async (topic, coachingOption, lastConversation = []) => {
  const option = CoachingOptions.find(
    (item) => item.name === coachingOption
  );

  if (!option) {
    throw new Error("Invalid coaching option");
  }

  if (!topic || typeof topic !== "string") {
    throw new Error("Invalid topic");
  }

  // ✅ Filter meaningful conversation
  const meaningfulConversation = Array.isArray(lastConversation)
    ? lastConversation.filter(
        (c) => c?.role && c?.content && c.content.trim() !== ""
      )
    : [];

  const PROMPT = option.prompt.replace("{user_topic}", topic);

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: PROMPT },
        ...meaningfulConversation,
      ],
      temperature: 0.7,
    });

    const message =
      completion?.choices?.[0]?.message;

    if (!message || !message.content) {
      console.error("❌ Empty AI chat response:", completion);
      throw new Error("AI failed to generate response");
    }

    return message;

  } catch (err) {
    console.error("❌ AIModel error:", err);
    throw err;
  }
};

// =====================
// TEXT → SPEECH (AWS Polly)
// =====================
export const ConvertTextToSpeech = async (text, expertName) => {
  if (!text || !expertName) {
    throw new Error("Text or voice is missing");
  }

  const pollyClient = new PollyClient({
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
    },
  });

  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: expertName,
  });

  try {
    const { AudioStream } = await pollyClient.send(command);
    const audioArrayBuffer = await AudioStream.transformToByteArray();
    const audioBlob = new Blob([audioArrayBuffer], { type: "audio/mp3" });
    return URL.createObjectURL(audioBlob);
  } catch (e) {
    console.error("❌ Polly error:", e);
    throw new Error("Text to speech failed");
  }
};


