"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { AIModel, ConvertTextToSpeech } from "@/services/GlobalServices";
import { CoachingExpert } from "@/services/Options";
import { useMutation, useQuery } from "convex/react";
import {
  Loader2Icon,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useContext, useEffect, useRef, useState } from "react";
import ChatBox from "./_components/ChatBox";
import { toast } from "sonner";
import { UserContext } from "@/app/_context/UserContext";

export default function DiscussionRoom() {
  const { roomid } = useParams();
  const { userData } = useContext(UserContext);

  const room = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });
  const saveConversation = useMutation(api.DiscussionRoom.UpdateConversation);

  // 🔑 AUDIO REFS
  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // 🎥 VIDEO REFS
  const videoRef = useRef(null);
  const videoStreamRef = useRef(null);

  const [expert, setExpert] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [enableFeedbackNotes, setEnableFeedbackNotes] = useState(false);

  // 🔐 AssemblyAI token
  const getAssemblyToken = async () => {
    const res = await fetch("/api/assembly-token");
    const data = await res.json();
    return data.token;
  };

  useEffect(() => {
    if (room) {
      setExpert(
        CoachingExpert.find((e) => e.name === room.expertName) || null
      );
    }
  }, [room]);

  // 🎤 CONNECT MIC
  const connect = async () => {
    setLoading(true);
    try {
      const token = await getAssemblyToken();
      const ws = new WebSocket(
        `wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&token=${token}`
      );

      socketRef.current = ws;

      ws.onopen = () => {
        toast.success("🎤 Listening...");
        setMicOn(true);
      };
      
      const generateFeedback = async () => {
  try {
    const res = await fetch("/api/generate-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coachingOption: room.coachingOption,
        conversation,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    toast.success("Feedback generated successfully");
    console.log("FEEDBACK:", data.result);
  } catch (err) {
    console.error(err);
    toast.error("Internal server error, Try again!");
  }
};


      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.transcript) setTranscript(data.transcript);

        if (data.end_of_turn && data.transcript) {
          setTranscript("");
          setConversation((p) => [
            ...p,
            { role: "user", content: data.transcript },
          ]);
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        const input = e.inputBuffer.getChannelData(0);
        const pcm16 = new Int16Array(input.length);

        for (let i = 0; i < input.length; i++) {
          pcm16[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
        }

        ws.send(pcm16.buffer);
      };
    } catch (err) {
      console.error(err);
      toast.error("Microphone error");
    } finally {
      setLoading(false);
    }
  };

  // 🛑 DISCONNECT MIC
const disconnect = async () => {
  processorRef.current?.disconnect();
  audioContextRef.current?.close();
  mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
  socketRef.current?.close();

  setMicOn(false);

  // ✅ filter meaningful conversation
  const meaningfulConversation = conversation.filter(
    (c) => c?.role && c?.content && c.content.trim() !== ""
  );

  if (meaningfulConversation.length >= 2) {
    setEnableFeedbackNotes(true);

    await saveConversation({
      id: room._id,
      conversation: meaningfulConversation,
    });
  } else {
    toast.error("Not enough conversation to generate feedback");
  }

  toast.success("Disconnected");
};


  // 🎥 TOGGLE CAMERA
  const toggleCamera = async () => {
  if (!cameraOn) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStreamRef.current = stream;

    // 🔴 FIX: wait until video element exists
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    setCameraOn(true);
  } else {
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    setCameraOn(false);
  }
};


  // 🤖 AI RESPONSE
  useEffect(() => {
  const runAI = async () => {
    if (!conversation.length) return;

    const last = conversation[conversation.length - 1];
    if (last.role !== "user") return;

    try {
      const ai = await AIModel(
        room.topic,
        room.coachingOption,
        conversation.slice(-8)
      );

      if (!ai || !ai.content) return;

      const url = await ConvertTextToSpeech(ai.content, room.expertName);
      setAudioUrl(url);

      setConversation((prev) => [
        ...prev,
        { role: "assistant", content: ai.content },
      ]);
    } catch (err) {
      console.error("AI response error:", err);
    }
  };

  const t = setTimeout(runAI, 600);
  return () => clearTimeout(t);
}, [conversation, room]);



  if (!room) return <p>Loading…</p>;

  return (
    <div className="min-h-screen px-6 py-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <h2 className="text-2xl font-bold text-center mb-6">
        {room.coachingOption}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🎙 INTERVIEW PANEL */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 space-y-6">
          {/* 👤 Expert */}
          <div className="flex items-center gap-4">
            <Image
              src={expert?.avatar || "/placeholder.jpg"}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full border-4 border-gray-300"
            />
            <div>
              <h2 className="text-lg font-semibold">{expert?.name}</h2>
              <p className="text-sm text-gray-500">
                {micOn ? "Listening..." : "Mic Off"}
              </p>
            </div>
          </div>

          {/* 🎥 VIDEO BOX */}
          <div className="relative w-full h-[260px] bg-black rounded-xl overflow-hidden flex items-center justify-center">
  <video
    ref={videoRef}
    autoPlay
    muted
    playsInline
    className={`w-full h-full object-cover ${
      cameraOn ? "block" : "hidden"
    }`}
  />

  {!cameraOn && (
    <VideoOff className="text-white w-16 h-16 opacity-70" />
  )}

  <Button
    onClick={toggleCamera}
    className="absolute top-3 right-3"
    size="sm"
    variant={cameraOn ? "destructive" : "secondary"}
  >
    {cameraOn ? <VideoOff /> : <Video />}
  </Button>
</div>

          

          {/* 📝 TRANSCRIPT */}
          <div className="bg-gray-100 rounded-xl px-4 py-3 text-center italic text-gray-700">
            {transcript || "Start speaking to see live transcription..."}
          </div>

          {/* 🎧 AI AUDIO */}
          {audioUrl && <audio src={audioUrl} autoPlay />}

          {/* 🎛 CONTROLS */}
          <div className="flex justify-center gap-4">
            {!micOn ? (
              <Button onClick={connect} disabled={loading} size="lg">
                {loading ? (
                  <Loader2Icon className="animate-spin mr-2" />
                ) : (
                  <Mic className="mr-2" />
                )}
                Connect
              </Button>
            ) : (
              <Button variant="destructive" onClick={disconnect} size="lg">
                <MicOff className="mr-2" />
                Disconnect
              </Button>
            )}
          </div>
        </div>

        {/* 💬 CHAT */}
        <ChatBox
          conversation={conversation}
          enableFeedbackNotes={enableFeedbackNotes}
          coachingOption={room.coachingOption}
        />
      </div>
    </div>
  );
} 

