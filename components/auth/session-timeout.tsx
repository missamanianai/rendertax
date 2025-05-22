"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Timeout duration in milliseconds (30 minutes)
const TIMEOUT_DURATION = 30 * 60 * 1000
// Warning before timeout (1 minute before)
const WARNING_BEFORE_TIMEOUT = 1 * 60 * 1000
// Interval to check user activity (30 seconds)
const CHECK_INTERVAL = 30 * 1000

export function SessionTimeout() {
  const { data: session } = useSession()
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [showWarning, setShowWarning] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  // Update last activity time on user interactions
  const updateActivity = () => {
    setLastActivity(Date.now())
    setShowWarning(false)
  }

  // Format remaining time as MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60)
    const minutes = Math.floor((ms / 1000 / 60) % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Reset the session
  const resetSession = () => {
    updateActivity()
  }

  useEffect(() => {
    if (!session) return

    // Track user activity events
    const events = ["mousedown", "keypress", "scroll", "mousemove", "click", "touchstart"]

    const activityHandler = () => {
      updateActivity()
    }

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, activityHandler)
    })

    // Check for inactivity
    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastActivity
      const remaining = TIMEOUT_DURATION - elapsed

      // Show warning if time remaining is less than the warning threshold
      if (remaining < WARNING_BEFORE_TIMEOUT && remaining > 0 && !showWarning) {
        setShowWarning(true)
        setRemainingTime(remaining)
      }

      // Update remaining time if warning is shown
      if (showWarning) {
        setRemainingTime(remaining > 0 ? remaining : 0)
      }

      // Log out if inactive for timeout duration
      if (elapsed >= TIMEOUT_DURATION) {
        signOut({ callbackUrl: "/login?timeout=true" })
      }
    }, CHECK_INTERVAL)

    // Clean up
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, activityHandler)
      })
      clearInterval(interval)
    }
  }, [session, lastActivity, showWarning])

  if (!session) return null

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Timeout Warning</AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {formatTime(remainingTime)} due to inactivity. Would you like to continue your
            session?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => signOut({ callbackUrl: "/login" })}>Log Out</AlertDialogCancel>
          <AlertDialogAction onClick={resetSession}>Continue Session</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
