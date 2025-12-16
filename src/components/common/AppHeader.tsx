"use client";

import Image from "next/image";
import Link from "next/link";
import { SidebarIcon, Building2, HelpCircle, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { CompanySwitcher } from "./company-switcher";
import { LocationSwitcher } from "./location-switcher";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { UserProfileProps } from "@/utils/types";
import { useUserProfile } from "@/hooks/react-query/hooks/use-user";
import { useIsMobile } from "@/hooks/use-mobile";

import Logo from "../../images/logo.svg";

export function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { companies } = useCompanyContext();
  const isMobile = useIsMobile();

  // Determine if we're on a company-level or location-level route (show LocationSwitcher for both)
  const segments = pathname?.split("/").filter(Boolean) || [];
  const isCompanyOrLocationRoute =
    segments.length >= 3 && pathname !== "/dashboard/organizations";

  // Hide company switcher on organizations page
  const isOrganizationsPage = pathname === "/dashboard/organizations";

  // Extract slug for mobile nav "Back to company" button
  const slug = segments[2];

  // Determine if we're on location-level (not company-level) for showing "Back to company" button
  const isLocationLevel =
    segments.length >= 4 &&
    !["locations", "branding", "members", "billing", "analytics"].includes(
      segments[3]
    );

  const cachedUserProfile = queryClient.getQueryData<UserProfileProps>([
    "user-profile",
  ]);

  const shouldFetch = !cachedUserProfile && companies.length > 0;
  const { data: fetchedUserProfile } = useUserProfile({
    enabled: shouldFetch,
  });

  const userProfile = cachedUserProfile || fetchedUserProfile;

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

  const teamsData = companies.map((company) => ({
    name: company.company.name,
    logo: Building2,
    role: company.role === "owner" ? "Owner" : company.role,
    plan: "free", // Placeholder, replace with actual plan if available
    slug: company.company.slug,
  }));

  return (
    <header className="bg-background sticky top-0 z-50 flex flex-col w-full border-b">
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
        <div className="hidden md:flex items-center gap-2">
          <Image src={Logo} alt="SheetPilot Logo" className="h-5 w-auto mr-4" />

          {!isOrganizationsPage ? (
            <CompanySwitcher teams={teamsData} />
          ) : (
            <span className="text-sm font-medium">Organization</span>
          )}
          {isCompanyOrLocationRoute && (
            <>
              <span className="text-gray-600">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  shapeRendering="geometricPrecision"
                >
                  <path d="M16 3.549L7.12 20.600"></path>
                </svg>
              </span>
              <LocationSwitcher />
            </>
          )}
        </div>
        <div className="flex md:hidden items-center gap-2">
          <Image src={Logo} alt="SheetPilot Logo" className="h-5 w-auto" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              // TODO: Implement help/documentation link
              window.open("/help", "_blank");
            }}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
          <NavUser user={userData} />
        </div>
      </div>

      {isMobile && (
        <div className="md:hidden border-t px-3 py-1 bg-background">
          <div className="flex items-center gap-2">
            {isCompanyOrLocationRoute && isLocationLevel && slug && (
              <Link
                href={`/dashboard/${slug}/locations`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            )}
            {!isOrganizationsPage && <CompanySwitcher teams={teamsData} />}
            {isCompanyOrLocationRoute && <LocationSwitcher />}
          </div>
        </div>
      )}
    </header>
  );
}
