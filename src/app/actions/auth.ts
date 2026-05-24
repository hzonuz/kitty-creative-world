"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be 32 characters or less")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers and underscores are allowed",
    ),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  displayName: z.string().trim().max(64).optional().nullable(),
});

export type SignupState =
  | { ok: true }
  | { ok: false; error: string };

export async function signupAction(
  _prevState: SignupState | undefined,
  formData: FormData,
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName") || null,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const { username, email, password, displayName } = parsed.data;
  const usernameLower = username.toLowerCase();

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username: usernameLower }],
    },
    select: { username: true, email: true },
  });
  if (existing) {
    if (existing.email === email) {
      return { ok: false, error: "An account with that email already exists." };
    }
    return { ok: false, error: "Username is already taken." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      username: usernameLower,
      email,
      passwordHash,
      displayName: displayName || null,
    },
  });

  redirect("/auth/signin?registered=1");
}
