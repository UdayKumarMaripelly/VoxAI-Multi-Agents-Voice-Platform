"use client"

import { UserContext } from '@/app/_context/UserContext'
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@stackframe/stack';
import { Wallet2 } from 'lucide-react';
import Image from 'next/image';
import React, { useContext } from 'react'

function Credits() {
  const { userData } = useContext(UserContext);
  const user = useUser();

  const calculateProgress = () => {
    if (!userData?.credits) return 0;

    const maxCredits = userData?.subscriptionId ? 50000 : 5000;
    return Math.min((Number(userData.credits) / maxCredits) * 100, 100);
  };

  return (
    <div>

      {/* USER INFO */}
      <div className="flex gap-5 items-center">
        <Image
          src={user?.profileImageUrl || "/avatar-placeholder.png"}
          alt={user?.displayName ? `${user.displayName} profile image` : "User profile image"}
          width={60}
          height={60}
          className="rounded-full"
        />

        <div>
          <h2 className="text-lg font-bold">
            {user?.displayName || "User"}
          </h2>
          <h2 className="text-gray-500 text-sm">
            {user?.primaryEmail}
          </h2>
        </div>
      </div>

      <hr className="my-4" />

      {/* TOKEN USAGE */}
      <div>
        <h2 className="font-bold mb-1">Token Usage</h2>
        <h2 className="text-sm text-gray-600">
          {userData?.credits || 0} / {userData?.subscriptionId ? '50,000' : '5,000'}
        </h2>

        <Progress value={calculateProgress()} className="my-3" />

        {/* CURRENT PLAN */}
        <div className="flex justify-between items-center mt-4">
          <h2 className="font-bold">Current Plan</h2>
          <span className="px-3 py-1 bg-secondary rounded-lg text-sm">
            {userData?.subscriptionId ? 'Pro Plan' : 'Free Plan'}
          </span>
        </div>

        {/* UPGRADE CARD */}
        {!userData?.subscriptionId && (
          <div className="mt-6 p-5 border rounded-2xl">
            <div className="flex justify-between">
              <div>
                <h2 className="font-bold">Pro Plan</h2>
                <h2 className="text-sm text-gray-600">
                  50,000 Tokens
                </h2>
              </div>
              <h2 className="font-bold">$10 / Month</h2>
            </div>

            <hr className="my-3" />

            <Button className="w-full cursor-pointer flex items-center gap-2">
              <Wallet2 size={18} /> Upgrade $10
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Credits
