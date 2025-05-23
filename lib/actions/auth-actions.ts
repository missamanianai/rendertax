"use server"

import { hash } from "bcrypt"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function registerUser(data: z.infer<typeof registerSchema>) {
  try {
    const result = registerSchema.parse(data)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: result.email,
      },
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Hash password
    const hashedPassword = await hash(result.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: result.name,
        email: result.email,
        password: hashedPassword,
      },
    })

    return { success: true, userId: user.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid data provided" }
    }
    return { error: "An error occurred while registering" }
  }
}
