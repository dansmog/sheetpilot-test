"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { CompanyMemberProps } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useResendInvitation } from "@/hooks/react-query/hooks/use-company-members";
import { toast } from "sonner";

const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
    fired: "bg-gray-100 text-gray-800 border-gray-200",
    left: "bg-gray-100 text-gray-800 border-gray-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
};

const roleLabels = {
    owner: "Owner",
    manager: "Manager",
    employee: "Employee",
};

const roleColors = {
    owner: "bg-purple-100 text-purple-800 border-purple-200",
    manager: "bg-blue-100 text-blue-800 border-blue-200",
    employee: "bg-gray-100 text-gray-800 border-gray-200",
};

function MemberRowActions({ member }: { member: CompanyMemberProps }) {
    const resendInvitation = useResendInvitation();

    const handleResendInvitation = () => {
        toast.promise(
            resendInvitation.mutateAsync(member.id),
            {
                loading: "Resending invitation...",
                success: (data) => {
                    return `Invitation resent to ${data.invitation.email}`;
                },
                error: (error) => {
                    return error?.response?.data?.error || "Failed to resend invitation";
                },
            }
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(member.id)}
                >
                    Copy member ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Edit member</DropdownMenuItem>
                {member.status === "pending" && (
                    <DropdownMenuItem onClick={handleResendInvitation}>
                        Resend invitation
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                    Remove member
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export const memberColumns: ColumnDef<CompanyMemberProps>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "user",
        id: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const member = row.original;
            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        {member.user?.avatar_url ? (
                            <img
                                src={member.user.avatar_url}
                                alt={member.user.full_name || "User"}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xs font-medium">
                                {member.user?.full_name?.[0]?.toUpperCase() ||
                                    member.user?.email?.[0]?.toUpperCase() ||
                                    member.email?.[0]?.toUpperCase() ||
                                    "?"}
                            </div>
                        )}
                    </Avatar>
                    <div>
                        <div className="font-medium">
                            {member.user?.full_name || "Pending User"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {member.user?.email || member.email || "No email"}
                        </div>
                    </div>
                </div>
            );
        },
        sortingFn: (rowA, rowB) => {
            const nameA = rowA.original.user?.full_name || rowA.original.user?.email || rowA.original.email || "";
            const nameB = rowB.original.user?.full_name || rowB.original.user?.email || rowB.original.email || "";
            return nameA.localeCompare(nameB);
        },
    },
    {
        accessorKey: "role",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Role
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const role = row.getValue("role") as keyof typeof roleLabels;
            return (
                <Badge variant="outline" className={`font-normal ${roleColors[role]}`}>
                    {roleLabels[role]}
                </Badge>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const status = row.getValue("status") as keyof typeof statusColors;
            return (
                <Badge
                    variant="outline"
                    className={`capitalize ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "primary_location",
        id: "location",
        header: "Location",
        cell: ({ row }) => {
            const location = row.original.primary_location;
            return (
                <div className="text-sm">
                    {location ? (
                        <span>{location.name}</span>
                    ) : (
                        <span className="text-muted-foreground">No location</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "created_at",
        id: "joined",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Joined
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const member = row.original;
            if (member.status === "pending" && member.invitation_sent_at) {
                return (
                    <div className="text-sm">
                        <div className="text-muted-foreground">Invited</div>
                        <div className="text-xs">
                            {formatDistanceToNow(new Date(member.invitation_sent_at), {
                                addSuffix: true,
                            })}
                        </div>
                    </div>
                );
            }
            return (
                <div className="text-sm">
                    {formatDistanceToNow(new Date(member.created_at), {
                        addSuffix: true,
                    })}
                </div>
            );
        },
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
            const member = row.original;
            return <MemberRowActions member={member} />;
        },
    },
];
