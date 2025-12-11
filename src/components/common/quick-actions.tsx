"use client";

import { Plus, Building2, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModal } from "@/contexts/ModalContext";

export function QuickActions() {
  const { setOpenModal } = useModal();

  const handleAddCompany = () => {
    setOpenModal("addCompany");
  };

  const handleAddLocation = () => {
    setOpenModal("addLocation");
  };

  const handleAddEmployee = () => {
    setOpenModal("addEmployee");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleAddCompany} className="gap-2">
            <Building2 className="size-4" />
            <span>Add another company</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddLocation} className="gap-2">
            <MapPin className="size-4" />
            <span>Add a location</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAddEmployee} className="gap-2">
            <Users className="size-4" />
            <span>Add an employee</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
