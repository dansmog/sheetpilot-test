"use client";
import { use } from "react";

import { AppHeader } from "@/components/common/AppHeader";
import { AppSidebar } from "@/components/common/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { usePathname } from "next/navigation";
import { ModalProvider } from "@/contexts/ModalContext";
import { AddLocationModal } from "@/components/modals/add-location-modal";
import { AddEmployeeModal } from "@/components/modals/add-employee-modal";

export default function AppLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = use(params);
  const pathname = usePathname();

  return (
    <CompanyProvider slug={slug}>
      <ModalProvider>
        <div className="[--header-height:calc(--spacing(14))]">
          <SidebarProvider className="flex flex-col">
            <AppHeader />
            <div className="flex flex-1">
              <AppSidebar />
            </div>
          </SidebarProvider>
        </div>

        <AddLocationModal />
        <AddEmployeeModal />
      </ModalProvider>
    </CompanyProvider>
  );
}
