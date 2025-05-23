"use server";

import { z } from "zod";
import { createUser } from "@/lib/auth-options"; // Using the mock createUser

const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().min(1, "Name is required"),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;

export async function signUpUser(data: SignUpInput) {
  try {
    const validatedData = SignUpSchema.parse(data);
    // In a real app, you'd hash the password here if not handled by a DB adapter or ORM
    const user = await createUser({
      email: validatedData.email,
      password: validatedData.password, // createUser will hash it
      name: validatedData.name,
    });

    if (!user) {
      return { success: false, message: "User registration failed." };
    }
    // You might want to automatically sign in the user here, or redirect to login
    return { success: true, message: "User registered successfully. Please sign in." };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.errors.map(e => e.message).join(", ") };
    }
    if (error instanceof Error && error.message === "User already exists") {
        return { success: false, message: "An account with this email already exists." };
    }
    console.error("Sign up error:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
