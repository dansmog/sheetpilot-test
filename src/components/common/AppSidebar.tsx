"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  MapPin,
  FileText,
  Calendar,
  PieChart,
  Users,
  Palette,
  CreditCard,
  LayoutDashboard,
  Settings,
  ArrowLeft,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";

export function AppSidebar({
  slug,
  locationSlug,
  routeLevel,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  slug?: string;
  locationSlug?: string;
  routeLevel: "company" | "location";
}) {
  const pathname = usePathname();

  // Company-level menu items
  const companyNavMain = [
    {
      title: "Locations",
      url: `/dashboard/${slug}/locations`,
      icon: MapPin,
      isActive: pathname === `/dashboard/${slug}/locations`,
    },
    {
      title: "Branding",
      url: `/dashboard/${slug}/branding`,
      icon: Palette,
      isActive: pathname === `/dashboard/${slug}/branding`,
    },
    {
      title: "Members",
      url: `/dashboard/${slug}/members`,
      icon: Users,
      isActive: pathname === `/dashboard/${slug}/members`,
    },
    {
      title: "Billing",
      url: `/dashboard/${slug}/billing`,
      icon: CreditCard,
      isActive: pathname === `/dashboard/${slug}/billing`,
    },
    {
      title: "Analytics",
      url: `/dashboard/${slug}/analytics`,
      icon: PieChart,
      isActive: pathname === `/dashboard/${slug}/analytics`,
    },
  ];

  // Location-level menu items
  const locationNavMain = [
    {
      title: "Go back to company",
      url: `/dashboard/${slug}/locations`,
      icon: ArrowLeft,
      isActive: false,
    },
    {
      title: "Overview",
      url: `/dashboard/${slug}/${locationSlug}/overview`,
      icon: LayoutDashboard,
      isActive: pathname === `/dashboard/${slug}/${locationSlug}/overview`,
    },
    {
      title: "Worksheet",
      url: `/dashboard/${slug}/${locationSlug}/worksheet`,
      icon: FileText,
      isActive: pathname === `/dashboard/${slug}/${locationSlug}/worksheet`,
    },
    {
      title: "Shifts",
      url: `/dashboard/${slug}/${locationSlug}/shifts`,
      icon: Calendar,
      isActive: pathname === `/dashboard/${slug}/${locationSlug}/shifts`,
    },
    {
      title: "Employees",
      url: `/dashboard/${slug}/${locationSlug}/employees`,
      icon: Users,
      isActive: pathname === `/dashboard/${slug}/${locationSlug}/employees`,
    },
    {
      title: "Settings",
      url: `/dashboard/${slug}/${locationSlug}/settings`,
      icon: Settings,
      isActive: pathname === `/dashboard/${slug}/${locationSlug}/settings`,
    },
  ];

  // Select appropriate menu based on route level
  const navMain = routeLevel === "company" ? companyNavMain : locationNavMain;

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
