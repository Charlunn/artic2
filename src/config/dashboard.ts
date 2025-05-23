import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BookOpenText, ListChecks, BarChart3, Settings, FileText } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

export interface NavItem {
  titleKey: TranslationKey;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
}

export const dashboardConfig: { sidebarNav: NavItem[] } = {
  sidebarNav: [
    {
      titleKey: "dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      titleKey: "articleLibrary",
      href: "/dashboard/articles",
      icon: BookOpenText,
    },
    {
      titleKey: "learningPlan",
      href: "/dashboard/plan",
      icon: ListChecks,
    },
    {
      titleKey: "review",
      href: "/dashboard/review",
      icon: FileText, // Using FileText as a stand-in for Review
    },
    {
      titleKey: "statistics",
      href: "/dashboard/stats",
      icon: BarChart3,
    },
    {
      titleKey: "settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
};
