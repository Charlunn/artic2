import type { DefaultSession, DefaultUser } from "next-auth";
import type { User as DbUser } from "./db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: DbUser["role"];
      settings_language?: DbUser["settings_language"];
      settings_theme?: DbUser["settings_theme"];
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role?: DbUser["role"];
    settings_language?: DbUser["settings_language"];
    settings_theme?: DbUser["settings_theme"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: DbUser["role"];
    settings_language?: DbUser["settings_language"];
    settings_theme?: DbUser["settings_theme"];
  }
}
