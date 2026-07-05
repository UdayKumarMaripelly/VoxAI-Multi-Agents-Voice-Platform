"use client"

import React from 'react'
import { useUser } from '@stackframe/stack'
import FeatureAssistants from './_components/FeatureAssistants'
import History from './_components/History'
import Feedback from './_components/Feedback'

function Dashboard() {
  const user = useUser();

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#F9FAFB]">

      {/* ===== ANIMATIONS ===== */}
      <style>{`
        @keyframes scan {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }

        @keyframes pulseSoft {
          0%,100% { opacity: .4; }
          50% { opacity: .8; }
        }
      `}</style>

      {/* ===== AI ENERGY LAYERS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* scanning lines */}
        <div className="absolute top-32 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent animate-[scan_8s_linear_infinite]" />
        <div className="absolute top-[420px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent animate-[scan_12s_linear_infinite]" />

        {/* soft pulses */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-300/20 blur-[120px] animate-[pulseSoft_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 -left-40 w-[600px] h-[600px] rounded-full bg-sky-300/20 blur-[140px] animate-[pulseSoft_14s_ease-in-out_infinite]" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative px-6 md:px-12 py-10">

        {/* HEADER AREA */}
        <div className="mb-20">
          <p className="text-xs uppercase tracking-widest text-indigo-600 mb-2">
            Workspace
          </p>

          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''} 👋
          </h1>

          <p className="text-gray-600 max-w-4xl mt-3">
            VoxAi is live. Speak, practice, and receive feedback instantly while you perform.
          </p>

          <div className="mt-5 flex items-center gap-3 text-sm text-indigo-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            AI listening
          </div>
        </div>

        {/* FEATURE ASSISTANTS */}
        <div className="mb-24">
          <FeatureAssistants />
        </div>

        {/* DATA ZONE */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-14">

          {/* HISTORY */}
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Previous Sessions
              </h2>
              <span className="text-xs text-gray-400">
                Auto-saved
              </span>
            </div>

            <div className="border-t pt-6">
              <History />
            </div>
          </div>

          {/* FEEDBACK */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                AI Feedback
              </h2>
              <span className="text-xs text-purple-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Live
              </span>
            </div>

            <div className="border-t pt-6">
              <Feedback />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard




