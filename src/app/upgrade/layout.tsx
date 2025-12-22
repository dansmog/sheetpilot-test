"use client";

import { CompanyProvider } from "@/contexts/CompanyContext";

export default function UpgradeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyProvider>
      <div className="min-h-screen bg-white">{children}</div>
    </CompanyProvider>
  );
}
