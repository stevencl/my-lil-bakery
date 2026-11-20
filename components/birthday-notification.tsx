"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Gift } from "lucide-react"
import { getBirthdayInfo, getBirthdayMessage } from "@/lib/birthday"
import { Button } from "@/components/ui/button"

const STORAGE_KEY = "birthday-notification-dismissed"

export function BirthdayNotification() {
  const { data: session, status } = useSession()
  const [isDismissed, setIsDismissed] = useState(true)
  const [birthdayInfo, setBirthdayInfo] = useState<ReturnType<typeof getBirthdayInfo>>(null)

  useEffect(() => {
    // Only run when authenticated
    if (status !== "authenticated" || !session?.user) {
      return
    }

    // Fetch user's date of birth
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        if (response.ok) {
          const data = await response.json()
          
          if (data.user?.dateOfBirth) {
            const info = getBirthdayInfo(data.user.dateOfBirth)
            
            if (info && (info.isBirthdayToday || info.isUpcoming)) {
              setBirthdayInfo(info)
              
              // Check if notification was dismissed today
              const dismissedDate = localStorage.getItem(STORAGE_KEY)
              const today = new Date().toDateString()
              
              if (dismissedDate !== today) {
                setIsDismissed(false)
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile for birthday check:", error)
      }
    }

    fetchUserProfile()
  }, [session, status])

  const handleDismiss = () => {
    setIsDismissed(true)
    // Store dismissal with today's date
    localStorage.setItem(STORAGE_KEY, new Date().toDateString())
  }

  // Don't render if dismissed or no birthday info
  if (isDismissed || !birthdayInfo) {
    return null
  }

  const message = getBirthdayMessage(birthdayInfo.daysUntilBirthday)

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-top-5 duration-500">
      <Alert className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-300 shadow-lg">
        <Gift className="h-5 w-5 text-pink-600" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <span className="text-base font-medium text-gray-800 flex-1">
            {message}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 flex-shrink-0 hover:bg-pink-100"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
