"use server"

import { hash } from "bcryptjs" // Changed from bcrypt to bcryptjs
import { db } from "@/lib/db"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth"
import { revalidatePath } from "next/cache"
import { getUserByEmail } from "@/lib/data/user"

export async function registerUser(formData: RegisterFormValues) {
  try {
    // Validate form data
    const validatedFields = registerSchema.safeParse(formData)

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password, firstName, lastName, role } = validatedFields.data

    // Check if user already exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return {
        success: false,
        errors: {
          email: ["A user with this email already exists"],
        },
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    await db.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role,
      },
    })

    revalidatePath("/login")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      success: false,
      errors: {
        root: ["Something went wrong. Please try again."],
      },
    }
  }
}
