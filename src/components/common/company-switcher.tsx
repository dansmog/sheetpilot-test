"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { useCompanyContext } from "@/contexts/CompanyContext";
import { useModal } from "@/contexts/ModalContext";
import { Badge } from "@/components/ui/badge";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function CompanySwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
    role: string;
    slug: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const { currentCompany, switchCompany, companies } = useCompanyContext();
  const { setOpenModal } = useModal();



  // Find the active team based on current company from context
  const activeTeam = React.useMemo(() => {
    if (!currentCompany) return teams[0];
    return (
      teams.find((team) => team.slug === currentCompany.company.slug) ||
      teams[0]
    );
  }, [currentCompany, teams]);

  const handleTeamSwitch = (team: (typeof teams)[0]) => {
    const company = companies.find((c) => c.company.slug === team.slug);
    if (company) {
      switchCompany(company);
    }
  };

  if (!activeTeam || teams.length === 0) {
    return null;
  }

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "lite":
        return "bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-100";
      case "starter":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
      case "growth":
        return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100";
      case "scale":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-100";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100";
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className=" text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-lg">
                <activeTeam.logo className="size-4 text-black" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{activeTeam.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-4 px-1 py-0 capitalize border-0 ${getPlanColor(activeTeam.plan)}`}
                  >
                    {activeTeam.plan}
                  </Badge>
                </div>
                <span className="truncate text-xs">{activeTeam.role}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "bottom"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Your companies
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.slug}
                onClick={() => handleTeamSwitch(team)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <span>{team.name}</span>
                  <Badge
                    variant="secondary"
                    className={`text-[10px] h-4 px-1 py-0 capitalize ml-2 ${getPlanColor(team.plan)}`}
                  >
                    {team.plan}
                  </Badge>
                </div>

              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setOpenModal("addCompany")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add another company
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
