"use client"

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Mic, BookOpen, Brain } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FF] via-white to-[#EEF2FF] text-gray-900">

      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="relative w-36 h-10">
              <Image src="/logo1.svg" alt="VoxAi" fill className="object-contain" />
            </div>
          </Link>
          <Button
            onClick={handleGetStarted}
            className="rounded-xl px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition"
          >
            Start Coaching
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/60 via-purple-100/40 to-sky-100/60" />

        <div className="relative max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
          
          {/* TEXT */}
          <div>
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              AI Voice Coaching<br />
              <span className="text-indigo-600">That Improves You</span><br />
              As You Speak
            </h1>

            <p className="text-lg text-gray-600 mb-10 max-w-xl">
              VoxAi listens in real time, analyzes your speech, and gives instant,
              actionable feedback to help you speak with confidence.
            </p>

            <div className="flex gap-4">
              <Button
                onClick={handleGetStarted}
                className="px-8 py-4 rounded-xl bg-indigo-600 text-white text-lg hover:scale-105 transition shadow-lg"
              >
                Try Free AI Session
              </Button>
              <Button
                variant="outline"
                className="px-8 py-4 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* VISUAL CARD */}
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-indigo-100">
              <p className="text-sm text-gray-400 mb-3">Live Coaching</p>
              <div className="h-3 w-full bg-gray-100 rounded mb-6" />

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-indigo-50 text-indigo-700">
                  “Try answering confidently.”
                </div>
                <div className="p-4 rounded-xl bg-gray-100 text-gray-700">
                  “I believe my strengths are…”
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm text-indigo-600">
                <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                AI listening…
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Designed for Real Conversations
          </h2>
          <p className="text-gray-600 mb-16">
            Everything you need to practice, improve, and gain confidence.
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Mic, title: "Speak Naturally", desc: "Just talk — no scripts, no pressure." },
              { icon: Brain, title: "AI Understands", desc: "Instant analysis of clarity, pace, and tone." },
              { icon: BookOpen, title: "Actionable Feedback", desc: "Clear steps to improve every session." }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl border hover:shadow-xl transition bg-gradient-to-b from-white to-indigo-50"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 mx-auto">
                    <Icon className="text-indigo-600 w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-gray-600">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-indigo-600 text-white text-center">
        <h2 className="text-4xl font-bold mb-6">
          Start Speaking With Confidence
        </h2>
        <Button
          onClick={handleGetStarted}
          className="px-12 py-5 rounded-xl bg-white text-indigo-600 text-lg font-semibold hover:scale-105 transition"
        >
          Get Started Free
        </Button>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-sm text-gray-500 bg-white">
        © {new Date().getFullYear()} VoxAi. All rights reserved.
      </footer>
    </div>
  );
}







