"use server"

import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"

interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "TAX_PROFESSIONAL" | "INDIVIDUAL"
}

export async function registerUser(formData: RegisterFormData) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: formData.email,
      },
    })

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists.",
      }
    }

    // Hash password
    const hashedPassword = await hash(formData.password, 10)

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: formData.email,
        passwordHash: hashedPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      },
    })

    revalidatePath("/login")

    return {
      success: true,
      userId: user.id,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: "Failed to create account. Please try again later.",
    }
  }
}
