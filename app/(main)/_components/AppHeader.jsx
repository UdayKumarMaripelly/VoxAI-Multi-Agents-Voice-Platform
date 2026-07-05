"use client"

import { UserButton } from '@stackframe/stack'
import Image from 'next/image'
import React from 'react'

function AppHeader() {
  return (
    <header
      className="
        sticky top-0 z-50 w-full
        bg-white/80 backdrop-blur
        border-b
      "
    >
      <div
        className="
          h-16 md:h-18
          px-6 md:px-10
          flex items-center justify-between
        "
      >
        {/* LOGO */}
        <div className="flex items-center">
          <Image
            src="/logo1.svg"
            alt="VoxAi logo"
            width={120}
            height={40}
            className="cursor-pointer transition-opacity hover:opacity-90"
          />
        </div>

        {/* USER ACTION */}
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  )
}

export default AppHeader
