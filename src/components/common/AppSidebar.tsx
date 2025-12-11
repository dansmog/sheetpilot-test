"use client";

import * as React from "react";
import {
  Home,
  MapPin,
  FileText,
  Calendar,
  PieChart,
  Users,
  LifeBuoy,
  Send,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";

export function AppSidebar({
  slug,
  ...props
}: React.ComponentProps<typeof Sidebar> & { slug?: string }) {

  const navMain = [
    {
      title: "Home",
      url: `/dashboard/${slug}`,
      icon: Home,
    },
    {
      title: "Locations",
      url: `/dashboard/${slug}/locations`,
      icon: MapPin,
    },
    {
      title: "Employees",
      url: `/dashboard/${slug}/employees`,
      icon: Users,
    },
    {
      title: "Sheets",
      url: `/dashboard/${slug}/sheets`,
      icon: FileText,
    },
    {
      title: "Shifts",
      url: `/dashboard/${slug}/shifts`,
      icon: Calendar,
    },
    {
      title: "Analytics",
      url: `/dashboard/${slug}/analytics`,
      icon: PieChart,
    },
  ];

  const navSecondary = [
    {
      title: "Support",
      url: "/dashboard/feedback",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ];

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader />
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
    </Sidebar>
  );
}
