import type { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { User } from "@/types/db"; // Your DB user type

// This is a MOCK user store. Replace with actual database calls.
const users: User[] = [
  {
    user_id: "1",
    email: "user@example.com",
    password_hash: bcrypt.hashSync("password123", 10),
    name: "Test User",
    role: "user",
    created_at: new Date(),
    settings_language: "zh",
    settings_theme: "light",
    stats_total_study_days: 0,
    stats_extra_study_days: 0,
    stats_extra_rest_days: 0,
    stats_net_extra_study_days: 0,
    stats_total_learning_time_overall: 0,
    stats_total_review_time_overall: 0,
  },
  {
    user_id: "2",
    email: "admin@example.com",
    password_hash: bcrypt.hashSync("adminpassword", 10),
    name: "Admin User",
    role: "admin",
    created_at: new Date(),
    settings_language: "en",
    settings_theme: "dark",
    stats_total_study_days: 0,
    stats_extra_study_days: 0,
    stats_extra_rest_days: 0,
    stats_net_extra_study_days: 0,
    stats_total_learning_time_overall: 0,
    stats_total_review_time_overall: 0,
  },
];

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
        // Replace with actual database lookup
        const user = users.find((u) => u.email === credentials.email);

        if (user && user.password_hash && bcrypt.compareSync(credentials.password, user.password_hash)) {
          // Return the user object that NextAuth expects
          return {
            id: user.user_id,
            email: user.email,
            name: user.name,
            role: user.role,
            settings_language: user.settings_language,
            settings_theme: user.settings_theme,
          } as NextAuthUser & { role: User["role"], settings_language: User["settings_language"], settings_theme: User["settings_theme"] }; // Cast to include custom props
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
        // @ts-ignore // NextAuth types can be tricky with custom props
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
        session.user.role = token.role as User["role"];
        session.user.settings_language = token.settings_language as User["settings_language"];
        session.user.settings_theme = token.settings_theme as User["settings_theme"];
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

// Mock function to create a user - in a real app, this would be in your DB layer
export async function createUser(data: Pick<User, "email" | "name"> & { password?: string }): Promise<User | null> {
  if (!data.password) return null;
  const existingUser = users.find(u => u.email === data.email);
  if (existingUser) {
    throw new Error("User already exists");
  }
  const newUser: User = {
    user_id: String(users.length + 1),
    email: data.email,
    password_hash: bcrypt.hashSync(data.password, 10),
    name: data.name,
    role: "user",
    created_at: new Date(),
    settings_language: "zh",
    settings_theme: "light",
    stats_total_study_days: 0,
    stats_extra_study_days: 0,
    stats_extra_rest_days: 0,
    stats_net_extra_study_days: 0,
    stats_total_learning_time_overall: 0,
    stats_total_review_time_overall: 0,
  };
  users.push(newUser);
  return newUser;
}

// Mock function to get user by email - in a real app, this would be in your DB layer
export async function getUserByEmail(email: string): Promise<User | null> {
  return users.find(u => u.email === email) || null;
}

// Mock function to update user settings - in a real app, this would be in your DB layer
export async function updateUser(userId: string, data: Partial<Pick<User, 'settings_language' | 'settings_theme'>>): Promise<User | null> {
  const userIndex = users.findIndex(u => u.user_id === userId);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...data };
  return users[userIndex];
}
