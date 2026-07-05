import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { LoaderCircle } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function ChatBox({ conversation, enableFeedbackNotes, coachingOption }) {
  const [loading, setLoading] = useState(false);
  const updateSummary = useMutation(api.DiscussionRoom.UpdateSummery);
  const { roomid } = useParams();

  const GenerateFeedbackNotes = async () => {
    const validConversation = Array.isArray(conversation)
      ? conversation.filter(
          (c) => c?.role && c?.content && c.content.trim() !== ""
        )
      : [];

    if (validConversation.length < 2) {
      toast.error("Please have a short conversation before generating feedback");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/generate-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachingOption,
          conversation: validConversation,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.result) {
        throw new Error(data?.error || "Failed to generate feedback");
      }

      await updateSummary({
        id: roomid,
        summery: data.result,
      });

      toast.success("Feedback / Notes Saved!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Chat Area */}
      <div className="
        h-[60vh]
        bg-gray-50
        border border-gray-200
        rounded-xl
        flex flex-col
        p-4
        overflow-y-auto
        space-y-2
      ">
        <AnimatePresence>
          {conversation.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${
                item.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[75%]
                  px-3 py-2
                  rounded-lg
                  text-sm
                  leading-relaxed
                  ${
                    item.role === "assistant"
                      ? "bg-white border border-gray-200 text-gray-800"
                      : "bg-indigo-600 text-white"
                  }
                `}
              >
                {item.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Button */}
      {enableFeedbackNotes && (
        <Button
          onClick={GenerateFeedbackNotes}
          disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2"
        >
          {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
          Generate Feedback / Notes
        </Button>
      )}
    </div>
  );
}

export default ChatBox;

