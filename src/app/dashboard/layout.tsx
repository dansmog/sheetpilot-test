"use client";

import { AppHeader } from "@/components/common/AppHeader";
import { AppSidebar } from "@/components/common/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { AddEmployeeModal } from "@/components/modals/add-employee-modal";
import { AddLocationModal } from "@/components/modals/add-location-modal";
import { AddCompanyModal } from "@/components/modals/add-company-modal";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || [];

  // Determine route level and extract slugs
  let routeLevel: "organization" | "company" | "location" | null = null;
  let slug: string | undefined;
  let locationSlug: string | undefined;

  if (pathname === "/dashboard/organizations") {
    routeLevel = "organization";
  } else if (segments.length >= 2) {
    // /dashboard/{slug}/{page} or /dashboard/{slug}/{locationSlug}/{page}
    // segments[0] is "dashboard", segments[1] is slug
    slug = segments[1];

    // Check if third segment could be a location slug
    // Location routes have pattern: /dashboard/{slug}/{locationSlug}/{page}
    // Company routes have pattern: /dashboard/{slug}/{page}
    // We can differentiate by checking against known company-level pages
    const knownCompanyPages = [
      "locations",
      "branding",
      "members",
      "billing",
      "analytics",
    ];

    if (segments.length >= 4 && !knownCompanyPages.includes(segments[2])) {
      // /dashboard/{slug}/{locationSlug}/{page} - location level
      locationSlug = segments[2];
      routeLevel = "location";
    } else if (segments.length >= 3) {
      // /dashboard/{slug}/{page} - company level
      routeLevel = "company";
    }
  }

  return (
    <CompanyProvider slug={slug}>
      <LocationProvider locationSlug={locationSlug}>
        <ModalProvider>
          <div className="[--header-height:calc(--spacing(14))]">
            <SidebarProvider className="flex flex-col">
              <AppHeader />
              <div className="flex flex-1">
                {routeLevel !== "organization" && routeLevel && (
                  <AppSidebar
                    slug={slug}
                    locationSlug={locationSlug}
                    routeLevel={routeLevel}
                  />
                )}
                <SidebarInset>
                  <main className="w-full">{children}</main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </div>

          <AddLocationModal />
          <AddEmployeeModal />
          <AddCompanyModal />
        </ModalProvider>
      </LocationProvider>
    </CompanyProvider>
  );
}
