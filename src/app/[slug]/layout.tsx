"use client";

import { AppSidebar } from "@/components/common/AppSidebar";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { QuickActions } from "@/components/common/quick-actions";
import { AddLocationModal } from "@/components/modals/add-location-modal";
import { AddEmployeeModal } from "@/components/modals/add-employee-modal";
import { use } from "react";
import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function CompanyLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = use(params);
  const pathname = usePathname();

  const isBillingPage = pathname?.includes('/billing');

  return (
    <CompanyProvider slug={slug}>
      <ModalProvider>
        <SidebarProvider>
          <AppSidebar slug={slug} />
          <SidebarInset>
            {!isBillingPage && (
              <header className="flex h-16 shrink-0 justify-between items-center gap-2">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">
                          Building Your Application
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="px-4">
                  <QuickActions />
                </div>
              </header>
            )}
            <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
        <AddLocationModal />
        <AddEmployeeModal />
      </ModalProvider>
    </CompanyProvider>
  );
}
