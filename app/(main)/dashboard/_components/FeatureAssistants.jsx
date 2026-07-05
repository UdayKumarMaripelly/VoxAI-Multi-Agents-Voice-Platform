"use client"

import { BlurFade } from '@/components/magicui/blur-fade';
import { CoachingOptions } from '@/services/Options';
import Image from 'next/image';
import React from 'react'
import UserInputDialog from './UserInputDialog';
import ProfileDailog from './ProfileDailog';
import { Button } from '@/components/ui/button';

function FeatureAssistants() {
  return (
    <div>

      {/* TOP ACTION ROW (NO USERNAME) */}
      <div className="flex justify-end mb-6">
        <ProfileDailog>
          <Button
            variant="outline"
            className="rounded-full px-5 hover:bg-secondary transition"
          >
            Profile
          </Button>
        </ProfileDailog>
      </div>

      {/* ASSISTANTS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
        {CoachingOptions.map((option, index) => (
          <BlurFade key={option.icon} delay={0.25 + index * 0.05} inView>
            <UserInputDialog coachingOption={option}>
              <div className="p-5 bg-secondary rounded-3xl flex flex-col items-center hover:scale-105 transition cursor-pointer">
                <Image
                  src={option.icon}
                  alt={option.name}
                  width={70}
                  height={70}
                  className="hover:rotate-12 transition"
                />
                <h2 className="mt-3 font-medium text-sm">
                  {option.name}
                </h2>
              </div>
            </UserInputDialog>
          </BlurFade>
        ))}
      </div>
    </div>
  )
}

export default FeatureAssistants

