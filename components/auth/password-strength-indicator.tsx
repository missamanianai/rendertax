"use client"

import { useEffect, useState } from "react"

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const [strength, setStrength] = useState(0)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!password) {
      setStrength(0)
      setMessage("")
      return
    }

    let currentStrength = 0

    // Length check
    if (password.length >= 8) currentStrength += 1

    // Uppercase check
    if (/[A-Z]/.test(password)) currentStrength += 1

    // Lowercase check
    if (/[a-z]/.test(password)) currentStrength += 1

    // Number check
    if (/[0-9]/.test(password)) currentStrength += 1

    // Special character check
    if (/[^A-Za-z0-9]/.test(password)) currentStrength += 1

    setStrength(currentStrength)

    // Set message based on strength
    if (currentStrength === 0) {
      setMessage("")
    } else if (currentStrength <= 2) {
      setMessage("Weak")
    } else if (currentStrength <= 4) {
      setMessage("Medium")
    } else {
      setMessage("Strong")
    }
  }, [password])

  if (!password) return null

  return (
    <div className="mt-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full ${strength <= 2 ? "bg-red-500" : strength <= 4 ? "bg-yellow-500" : "bg-green-500"}`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      <p
        className={`mt-1 text-xs ${
          strength <= 2 ? "text-red-500" : strength <= 4 ? "text-yellow-500" : "text-green-500"
        }`}
      >
        {message}
      </p>
    </div>
  )
}
