'use server';

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export type AuthActionState = { error?: string };

export async function doSocialLogin(formData: FormData) {
  const action = String(formData.get("action") ?? "google");

  if (action !== "google" && action !== "github") return;

  await signIn(action, { redirectTo: "/" });
}

export async function signInWithCredentials(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "That email and password combination was not found." };
    }

    throw error;
  }

  return {};
}

export async function signUpWithCredentials(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Complete all fields to create your account." };
  }
  if (name.length > 100) return { error: "Name must be 100 characters or fewer." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Use a password with at least 8 characters." };

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    return { error: "An account with that email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.create({ data: { name, email, password: hashedPassword } });
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Your account was created, but sign-in failed. Please sign in." };
    }

    throw error;
  }

  return {};
}

export async function doLogout() {
  await signOut({ redirectTo: "/login" });
}

export async function deleteUser(formData: FormData) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const sessionEmail = session?.user?.email?.trim().toLowerCase();
  const userId = Number(formData.get("userId"));

  if (!adminEmail || sessionEmail !== adminEmail) {
    throw new Error("You are not authorized to delete users.");
  }
  if (!Number.isSafeInteger(userId) || userId < 1) return;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!target || target.email.toLowerCase() === adminEmail) return;

  await prisma.$transaction(async (transaction) => {
    await transaction.profile.deleteMany({ where: { userId } });
    await transaction.user.delete({ where: { id: userId } });
  });

  revalidatePath("/");
  revalidatePath("/home");
}