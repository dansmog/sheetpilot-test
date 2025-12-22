"use client";

import { CompanyMemberProps } from "@/utils/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface MemberListProps {
    members: CompanyMemberProps[];
    isLoading?: boolean;
}

const statusColors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
    fired: "bg-gray-100 text-gray-800",
    left: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
};

const roleLabels = {
    owner: "Owner",
    manager: "Manager",
    employee: "Employee",
};

export function MemberList({ members, isLoading }: MemberListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="p-4 border border-subtle rounded-lg animate-pulse"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (members.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {members.map((member) => (
                <div
                    key={member.id}
                    className="p-4 border border-subtle rounded-lg hover:bg-accent/50 transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="w-10 h-10">
                                {member.user?.avatar_url ? (
                                    <img
                                        src={member.user.avatar_url}
                                        alt={member.user.full_name || "User"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                        {member.user?.full_name?.[0]?.toUpperCase() ||
                                            member.user?.email?.[0]?.toUpperCase() ||
                                            "?"}
                                    </div>
                                )}
                            </Avatar>

                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium">
                                        {member.user?.full_name || "Pending User"}
                                    </h3>
                                    <Badge variant="secondary" className="text-xs">
                                        {roleLabels[member.role]}
                                    </Badge>
                                    <Badge
                                        className={`text-xs ${statusColors[member.status] || "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {member.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {member.user?.email || "No email"}
                                </p>
                                {member.primary_location && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        📍 {member.primary_location.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="text-right text-sm text-muted-foreground">
                            {member.status === "pending" && member.invitation_sent_at ? (
                                <div>
                                    <p className="text-xs">Invited</p>
                                    <p className="text-xs">
                                        {formatDistanceToNow(new Date(member.invitation_sent_at), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                    {member.invitation_expires_at && (
                                        <p className="text-xs text-red-600">
                                            Expires{" "}
                                            {formatDistanceToNow(
                                                new Date(member.invitation_expires_at),
                                                {
                                                    addSuffix: true,
                                                }
                                            )}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p className="text-xs">Joined</p>
                                    <p className="text-xs">
                                        {formatDistanceToNow(new Date(member.created_at), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
