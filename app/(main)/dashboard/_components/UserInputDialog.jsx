"use client"

import React, { useContext, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from '@/components/ui/textarea'
import { CoachingExpert } from '@/services/Options'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { UserContext } from '@/app/_context/UserContext'

function UserInputDialog({ children, coachingOption }) {
  const [selectedExpert, setSelectedExpert] = useState(null)
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)

  const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom)
  const router = useRouter()
  const { userData } = useContext(UserContext)

  const OnClickNext = async () => {
    setLoading(true)

    const result = await createDiscussionRoom({
      topic,
      coachingOption: coachingOption?.name,
      expertName: selectedExpert,
      uid: userData?._id,
    })

    setLoading(false)
    setOpenDialog(false)
    router.push('/discussion-room/' + result)
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* SOFT AI HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {coachingOption.name}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            Set up your AI coaching session
          </p>
        </div>

        <DialogDescription asChild>
          <div className="px-6 py-6 space-y-6">

            {/* TOPIC INPUT */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Topic
              </label>
              <Textarea
                placeholder="Enter your topic here…"
                className="
                  mt-2 min-h-[90px]
                  focus-visible:ring-2 focus-visible:ring-indigo-400
                  transition
                "
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* EXPERT SELECTION */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Choose your AI expert
              </h3>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-5">
                {CoachingExpert.map((expert, index) => {
                  const active = selectedExpert === expert.name

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedExpert(expert.name)}
                      className={`
                        flex flex-col items-center gap-2 p-2 rounded-xl
                        transition-all duration-200
                        ${active
                          ? "ring-2 ring-indigo-500 scale-105 bg-indigo-50"
                          : "hover:bg-gray-50 hover:scale-105"
                        }
                      `}
                    >
                      <Image
                        src={expert.avatar}
                        alt={`${expert.name} avatar`}
                        width={80}
                        height={80}
                        className="rounded-xl object-cover"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {expert.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <DialogClose asChild>
                <Button variant="ghost">
                  Cancel
                </Button>
              </DialogClose>

              <Button
                onClick={OnClickNext}
                disabled={!topic || !selectedExpert || loading}
                className="
                  bg-gradient-to-r from-indigo-500 to-sky-500
                  hover:from-indigo-600 hover:to-sky-600
                  text-white
                "
              >
                {loading && <LoaderCircle className="animate-spin mr-2" />}
                Next
              </Button>
            </div>

          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

export default UserInputDialog
