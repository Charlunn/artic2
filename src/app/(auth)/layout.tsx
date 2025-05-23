import type { ReactNode } from "react";
import Link from "next/link";
import { BookHeart } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center text-2xl font-semibold text-primary">
          <BookHeart className="mr-3 h-8 w-8" />
          <span>{SITE_NAME}</span>
        </Link>
        <div className="rounded-xl border bg-card p-6 shadow-lg sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
