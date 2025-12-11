"use client";

import { SidebarIcon, Building2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { CompanySwitcher } from "./company-switcher";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { UserProfileProps } from "@/utils/types";
import { useUserProfile } from "@/hooks/react-query/hooks/use-user";

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const queryClient = useQueryClient();
  const { companies } = useCompanyContext();

  const cachedUserProfile = queryClient.getQueryData<UserProfileProps>([
    "user-profile",
  ]);

  // Only fetch if not in cache and there's at least one company
  const shouldFetch = !cachedUserProfile && companies.length > 0;
  const { data: fetchedUserProfile } = useUserProfile({
    enabled: shouldFetch,
  });

  // Use cached profile if available, otherwise use fetched profile
  const userProfile = cachedUserProfile || fetchedUserProfile;

  // Transform user data for NavUser
  const userData = userProfile
    ? {
        name: userProfile.full_name || "User",
        email: userProfile.email,
        avatar: userProfile.avatar_url || "/avatars/default.jpg",
      }
    : {
        name: "Loading...",
        email: "",
        avatar: "",
      };

  console.log({ companies });

  // Transform companies for CompanySwitcher
  const teamsData = companies.map((company) => ({
    name: company.company.name,
    logo: Building2,
    role: company.role === "owner" ? "Owner" : company.role,
    slug: company.company.slug,
  }));

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="w-fit">
          <CompanySwitcher teams={teamsData} />
        </div>
        <div className="ml-auto">
          <NavUser user={userData} />
        </div>
      </div>
    </header>
  );
}
