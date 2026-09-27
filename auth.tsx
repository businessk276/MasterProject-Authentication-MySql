import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "").trim().toLowerCase();
        const password = String(credentials.password ?? "");

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) return null;

        return { id: String(user.id), name: user.name, email: user.email };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.type !== "oauth" || !user.email) return true;

      const email = user.email.trim().toLowerCase();
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true },
      });

      if (existingUser) {
        if (user.name && user.name !== existingUser.name) {
          await prisma.user.update({ where: { id: existingUser.id }, data: { name: user.name } });
        }
        return true;
      }

      const unusablePassword = await bcrypt.hash(randomBytes(32).toString("hex"), 12);
      await prisma.user.create({
        data: { name: user.name?.trim() || email, email, password: unusablePassword },
      });
      return true;
    },
  },
});

export const { GET, POST } = handlers;
