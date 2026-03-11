import NextAuth, { type NextAuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { LoginSchema } from "@/types/schemas";
import { loginRatelimit } from "@/lib/ratelimit";

// Extend Next-Auth types
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("CredentialsMissing");
        }

        // Validate credentials schema first
        const validatedCredentials = LoginSchema.safeParse(credentials);
        if (!validatedCredentials.success) {
          throw new Error("InvalidCredentials");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: { email: validatedCredentials.data.email },
        });

        if (!user) {
          throw new Error("UserNotFound");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          validatedCredentials.data.password,
          user.passwordHash
        );

        // Only apply rate limit on FAILED login attempts
        const rateLimitKey = validatedCredentials.data.email.toLowerCase();
        if (!isPasswordValid) {
          const { success: rateLimitOk } = await loginRatelimit.limit(rateLimitKey);
          if (!rateLimitOk) {
            throw new Error("RateLimitExceeded");
          }
          throw new Error("InvalidPassword");
        }

        // Return user object if credentials are valid
        return {
          id: user.id,
          email: user.email,
          name: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? "";
        token.role = (user as { role?: string }).role ?? "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const handler = NextAuth(authOptions);
