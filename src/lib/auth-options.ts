import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { User } from "@/types/db"; // Your DB user type
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client'; // Import Role enum

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && user.password_hash && bcrypt.compareSync(credentials.password, user.password_hash)) {
          // Return the user object that NextAuth expects
          return {
            id: user.user_id,
            email: user.email,
            name: user.username, 
            role: user.role,
            settings_language: user.settings_language, // Added from Prisma schema
            settings_theme: user.settings_theme,       // Added from Prisma schema
          } as NextAuthUser & { role: Role; settings_language: string; settings_theme: string }; 
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-ignore 
        token.role = user.role;
        // @ts-ignore
        token.settings_language = user.settings_language;
        // @ts-ignore
        token.settings_theme = user.settings_theme;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.settings_language = token.settings_language as string;
        session.user.settings_theme = token.settings_theme as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: '/auth/signout', // default
    // error: '/auth/error', // default
    // verifyRequest: '/auth/verify-request', // default for email provider
    // newUser: '/auth/signup' // If you want to redirect new users to a specific page after OAuth, not applicable for Credentials
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretkey", // IN_PRODUCTION_SET_NEXTAUTH_SECRET_ENV_VARIABLE
};

// Updated createUser function 
// Note: Input 'name' from application, maps to 'username' in Prisma
export async function createUser(data: { email: string, name: string, password?: string }): Promise<User | null> {
  if (!data.password) return null; 

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("User already exists with this email.");
  }

  const hashedPassword = bcrypt.hashSync(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      username: data.name, // Map 'name' to 'username'
      password_hash: hashedPassword,
      role: 'user', // Prisma schema handles default role
      // settings_language and settings_theme will use defaults from Prisma schema
    },
  });
  // Map Prisma user to the User type expected by the rest of the app if necessary
  // The returned user object from Prisma will include default settings_language and settings_theme
  return {
    ...newUser,
    name: newUser.username, // ensure 'name' field is populated for User type if it differs from Prisma
  } as any; 
}

// Updated getUserByEmail function
export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });
  return user as any; // Adjust casting as needed
}

// Updated updateUser function
export async function updateUser(userId: string, data: Partial<Pick<User, 'settings_language' | 'settings_theme' | 'name' /* Add other updatable fields if necessary */>>): Promise<User | null> {
  try {
    const updateData: any = {};
    if (data.settings_language) updateData.settings_language = data.settings_language;
    if (data.settings_theme) updateData.settings_theme = data.settings_theme;
    if (data.name) updateData.username = data.name; // Map 'name' to 'username'

    const updatedUserFromPrisma = await prisma.user.update({
      where: { user_id: userId }, 
      data: updateData,
    });
    
    // Map Prisma user (which has 'username') back to User type (which might expect 'name')
    return {
      ...updatedUserFromPrisma,
      name: updatedUserFromPrisma.username, // ensure 'name' field is populated for User type
    } as any;

  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}
