"use client";

import * as React from "react";
import { ChevronsUpDown, MapPin, Plus } from "lucide-react";
import { useLocationContext } from "@/contexts/LocationContext";
import { useModal } from "@/contexts/ModalContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function LocationSwitcher() {
  const { isMobile } = useSidebar();
  const { currentLocation, switchLocation, locations } = useLocationContext();
  const { setOpenModal } = useModal();

  const handleLocationSwitch = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (location) {
      switchLocation(location);
    }
  };

  // Don't render if there are no locations at all
  if (locations.length === 0) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-lg">
                <MapPin className="size-4 text-black" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentLocation ? currentLocation.name : "Select a location"}
                </span>
                <span className="hidden md:block truncate text-xs text-muted-foreground">
                  {currentLocation
                    ? currentLocation.address || "No address"
                    : "Choose a location"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "bottom"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Locations
            </DropdownMenuLabel>
            {locations.map((location) => (
              <DropdownMenuItem
                key={location.id}
                onClick={() => handleLocationSwitch(location.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <MapPin className="size-3.5 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{location.name}</span>
                  {location.address && (
                    <span className="text-muted-foreground text-xs">
                      {location.address}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setOpenModal("addLocation")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Add another location
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
