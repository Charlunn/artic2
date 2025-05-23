import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, updateUser } from "@/lib/auth-options"; // Assuming updateUser is a mock DB function
import type { User } from "@/types/db";
import { z } from "zod";

const settingsSchema = z.object({
  settings_language: z.enum(["en", "zh"]).optional(),
  settings_theme: z.enum(["light", "dark", "system"]).optional(),
});

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = settingsSchema.parse(body);
    
    // In a real app, update the user in the database
    const updatedUser = await updateUser(session.user.id, validatedData as Partial<Pick<User, 'settings_language' | 'settings_theme'>>);

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
    }
    
    // The session will be updated on next login or if explicitly refetched by client.
    // For immediate effect on current session object, you might need more complex session update logic.
    return NextResponse.json({ message: "Settings updated successfully", user: {
        settings_language: updatedUser.settings_language,
        settings_theme: updatedUser.settings_theme
    } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 });
    }
    console.error("Error updating settings:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
