"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { dashboardConfig } from "@/config/dashboard";
import type { NavItem } from "@/config/dashboard";
import { useI18n } from "@/hooks/use-i18n";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";


export function DashboardSidebarNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="p-2 space-y-1">
        {[...Array(5)].map((_, i) => (
          <SidebarMenuSkeleton key={i} showIcon />
        ))}
      </div>
    );
  }
  
  return (
    <SidebarMenu>
      {dashboardConfig.sidebarNav.map((item: NavItem) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
            tooltip={{ content: t(item.titleKey), side: "right", align: "center" }}
            className={cn(item.disabled && "cursor-not-allowed opacity-80")}
          >
            <Link href={item.disabled ? "#" : item.href}>
              <item.icon />
              <span>{t(item.titleKey)}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
