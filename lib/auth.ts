import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

// Demo user for testing
const demoUser = {
  id: "demo-user-1",
  name: "Demo User",
  email: "demo@example.com",
  password: "$2a$10$8VEZeIRjuUDQQBGHkJ8t6.l2Zs1FG.dEB5xwXKoBl0Xl1hcJO9VVi", // hashed "password123"
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // For demo purposes, we'll use a hardcoded user
        // In production, this would query the database
        if (credentials.email === demoUser.email) {
          const isPasswordValid = await compare(credentials.password, demoUser.password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
          }
        }

        // Allow any login for demo purposes
        if (credentials.email.includes("@") && credentials.password.length >= 6) {
          return {
            id: "user-" + Math.random().toString(36).substring(2, 9),
            email: credentials.email,
            name: credentials.email.split("@")[0],
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
}
