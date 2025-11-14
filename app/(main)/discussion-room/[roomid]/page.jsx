"use client";

import { Button } from '@/components/ui/button';
import { api } from '@/convex/_generated/api';
import { AIModel, ConvertTextToSpeech, getToken } from '@/services/GlobalServices';
import { CoachingExpert } from '@/services/Options';
import { UserButton } from '@stackframe/stack';
import { RealtimeTranscriber } from 'assemblyai';
import { useMutation, useQuery } from 'convex/react';
import { Loader2Icon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import ChatBox from './_components/ChatBox';
import { toast } from 'sonner';
import { UserContext } from '@/app/_context/UserContext';

// No need for top-level dynamic import of RecordRTC
// We'll dynamically import it inside connectToServer

function DiscussionRoom() {
  const { roomid } = useParams();
  const { userData, setUserData } = useContext(UserContext);

  // Initialize DiscussionRoomData safely
  const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoom, { id: roomid });

  // States
  const [expert, setExpert] = useState(null);
  const [enableMic, setEnableMic] = useState(false);
  const [transcribe, setTranscribe] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [enableFeedbackNotes, setEnableFeedbackNotes] = useState(false);

  // Refs
  const recorder = useRef(null);
  const realtimeTranscriber = useRef(null);
  const stream = useRef(null);

  // Convex mutations
  const UpdateConversation = useMutation(api.DiscussionRoom.UpdateConversation);
  const updateUserToken = useMutation(api.users.updateUserToken);

  // Other refs
  const silenceTimeout = useRef(null);
  const texts = useRef({});

  // Set expert based on DiscussionRoomData
  useEffect(() => {
    if (DiscussionRoomData) {
      const Expert = CoachingExpert.find(item => item.name === DiscussionRoomData?.expertName);
      setExpert(Expert || null);
    }
  }, [DiscussionRoomData]);

  // Function to update user token
  const updateUserTokenMethod = useCallback(
    async (text) => {
      const tokenCount = text.trim() ? text.trim().split(/\s+/).length : 0;
      if (!userData?._id) return;

      try {
        await updateUserToken({
          id: userData._id,
          credits: Number(userData.credits) - tokenCount
        });

        setUserData(prev => ({
          ...prev,
          credits: Number(userData.credits) - tokenCount
        }));
      } catch (err) {
        console.error("Failed to update user token:", err);
      }
    },
    [userData, updateUserToken, setUserData]
  );

  // Connect to AssemblyAI + record audio
const connectToServer = async () => {
  setLoading(true);

  try {
    // 1️⃣ Get your AssemblyAI token
    const { token } = await getToken();
    if (!token) throw new Error("Failed to get AssemblyAI token");
    console.log("Token received:", token);

    // 2️⃣ Open WebSocket connection to Universal Streaming API
    const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000`;
    const socket = new WebSocket(wsUrl, [], {
      headers: {
        Authorization: token,
      },
    });

    // Save WebSocket reference
    realtimeTranscriber.current = socket;

    // 3️⃣ Event: connection opened
    socket.onopen = () => {
      console.log("Connected to AssemblyAI Universal Streaming API");
      toast.success("Connected to server");
      setEnableMic(true);
    };

    // 4️⃣ Event: messages from server
    socket.onmessage = (msgEvent) => {
      try {
        const data = JSON.parse(msgEvent.data);

        if (data.message_type === "FinalTranscript") {
          const transcriptText = data.text;
          setConversation((prev) => [...prev, { role: "user", content: transcriptText }]);
          updateUserTokenMethod(transcriptText);
        }

        // Combine partial transcripts
        if (data.text) {
          texts.current[data.audio_start] = data.text;
          const sortedKeys = Object.keys(texts.current).sort((a, b) => a - b);
          let combined = "";
          for (const key of sortedKeys) {
            combined += texts.current[key] || "";
          }
          setTranscribe(combined);
        }
      } catch (err) {
        console.error("Error parsing WS message:", err);
      }
    };

    // 5️⃣ Event: errors
    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      toast.error("WebSocket error, check console.");
      setEnableMic(false);
    };

    // 6️⃣ Event: closed
    socket.onclose = (event) => {
      console.log("WebSocket closed:", event);
      setEnableMic(false);
    };

    // 7️⃣ Get microphone access and stream audio
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.current = mediaStream;

    // Dynamically import RecordRTC
    const RecordRTCModule = await import("recordrtc");
    const RecordRTC = RecordRTCModule.default;

    recorder.current = new RecordRTC(mediaStream, {
      type: "audio",
      mimeType: "audio/webm;codecs=pcm",
      recorderType: RecordRTC.StereoAudioRecorder,
      timeSlice: 250,
      desiredSampRate: 16000,
      numberOfAudioChannels: 1,
      bufferSize: 4096,
      audioBitsPerSecond: 128000,
      ondataavailable: async (blob) => {
        if (!realtimeTranscriber.current || realtimeTranscriber.current.readyState !== WebSocket.OPEN)
          return;

        const buffer = await blob.arrayBuffer();

        // Send audio as base64 per AssemblyAI's spec
        const base64Chunk = arrayBufferToBase64(buffer);
        realtimeTranscriber.current.send(JSON.stringify({ audio_data: base64Chunk }));
      },
    });

    recorder.current.startRecording();
  } catch (err) {
    console.error("Connect error:", err);
    toast.error("Failed to connect. Check console.");

    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop());
      stream.current = null;
    }

    recorder.current = null;
    realtimeTranscriber.current = null;
    setEnableMic(false);
  } finally {
    setLoading(false);
  }
};

// Helper: convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}



  // Cleanup function
  const cleanupResources = () => {
    if (stream.current) {
      stream.current.getTracks().forEach(track => track.stop());
      stream.current = null;
    }
    recorder.current = null;
    realtimeTranscriber.current = null;
    setEnableMic(false);
  };

  // Disconnect
  const disconnect = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (realtimeTranscriber.current) await realtimeTranscriber.current.close();
      if (recorder.current) {
        recorder.current.stopRecording(() => cleanupResources());
      } else {
        cleanupResources();
      }

      setEnableMic(false);
      toast('Disconnected!');
      await UpdateConversation({
        id: DiscussionRoomData?._id,
        conversation
      });
    } catch (err) {
      console.error("Error during disconnect:", err);
    } finally {
      setLoading(false);
      setEnableFeedbackNotes(true);
      if (silenceTimeout.current) clearTimeout(silenceTimeout.current);
    }
  };

  // Fetch AI response on conversation change
  useEffect(() => {
    const fetchAIResponse = async () => {
      if (!conversation.length) return;
      if (conversation[conversation.length - 1].role !== 'user') return;

      const lastTwoMsg = conversation.slice(-8);
      try {
        const aiResp = await AIModel(
          DiscussionRoomData?.topic,
          DiscussionRoomData?.coachingOption,
          lastTwoMsg
        );

        const url = await ConvertTextToSpeech(aiResp.content, DiscussionRoomData?.expertName);
        setAudioUrl(url);
        setConversation(prev => [...prev, aiResp]);
        await updateUserTokenMethod(aiResp.content);
      } catch (err) {
        console.error("AI fetch error:", err);
      }
    };

    const timeout = setTimeout(fetchAIResponse, 500);
    return () => clearTimeout(timeout);
  }, [conversation, DiscussionRoomData, updateUserTokenMethod]);

  // Render
  if (!DiscussionRoomData) return <p>Loading room data...</p>;

  return (
    <div className='-mt-12'>
      <h2 className='text-lg font-bold'>{DiscussionRoomData?.coachingOption}</h2>
      <div className='mt-5 grid grid-cols-1 lg:grid-cols-3 gap-10'>
        <div className='lg:col-span-2'>
          <div className='h-[60vh] bg-secondary rounded-4xl flex flex-col justify-center items-center relative'>
            <Image
              src={expert?.avatar || '/placeholder.png'}
              alt='Avatar'
              width={200}
              height={200}
              className='h-[80px] w-[80px] rounded-full object-cover animate-pulse'
            />
            <h2 className='text-gray-500'>{expert?.name || 'Unknown Expert'}</h2>

            {audioUrl && <audio src={audioUrl} type='audio/mp3' autoPlay />}

            <div className='p-5 bg-gray-200 px-10 rounded-lg absolute bottom-10 right-10'>
              <UserButton />
            </div>
          </div>

          <div className='mt-5 flex justify-center items-center cursor-pointer'>
            {!enableMic ? (
              <Button onClick={connectToServer} disabled={loading}>
                {loading && <Loader2Icon className='animate-spin' />} Connect
              </Button>
            ) : (
              <Button variant='destructive' onClick={disconnect} disabled={loading}>
                {loading && <Loader2Icon className='animate-spin' />} Disconnect
              </Button>
            )}
          </div>
        </div>

        <div>
          <ChatBox
            conversation={conversation}
            enableFeedbackNotes={enableFeedbackNotes}
            coachingOption={DiscussionRoomData?.coachingOption}
          />
        </div>
      </div>

      <div>
        <h2>{transcribe}</h2>
      </div>
    </div>
  );
}

export default DiscussionRoom;

