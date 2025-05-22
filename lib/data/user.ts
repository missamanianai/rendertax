import { db } from "@/lib/db"

export async function getUserByEmail(email: string) {
  try {
    return await db.user.findUnique({
      where: { email },
    })
  } catch (error) {
    console.error("Failed to get user by email:", error)
    return null
  }
}

export async function getUserById(id: string) {
  try {
    return await db.user.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error("Failed to get user by id:", error)
    return null
  }
}
