"use client"; // Required for SidebarProvider and other client components

import type { ReactNode } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebarNav } from "@/components/layout/dashboard-sidebar-nav";
import Link from "next/link";
import { BookHeart } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";


export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <BookHeart className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  if (!session) {
     // This should ideally be caught by middleware or useEffect redirect,
     // but as a fallback.
    return null;
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-primary">
            <BookHeart className="h-6 w-6" />
            <span className="group-data-[collapsible=icon]:hidden">{SITE_NAME}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <DashboardSidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* Optional: Sidebar footer content */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
