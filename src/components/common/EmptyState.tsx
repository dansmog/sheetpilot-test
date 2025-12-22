"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LockedFeature } from "@/components/paywall/LockedFeature";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  actionVariant?: "default" | "success" | "outline";
  actionDisabled?: boolean;
  actionLockReason?: string;
  className?: string;
  iconClassName?: string;
  centered?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  actionVariant = "default",
  actionDisabled = false,
  actionLockReason,
  className,
  iconClassName,
  centered = true,
}: EmptyStateProps) {
  const content = (
    <div className={cn("max-w-md w-full", className)}>
      <div className="flex flex-col items-center text-center p-8 gap-4">
        {Icon && (
          <div
            className={cn(
              "w-16 h-16 rounded-full bg-[#f6f7f9] dark:bg-muted flex items-center justify-center",
              iconClassName
            )}
          >
            <Icon className="w-8 h-8 text-[#475569] dark:text-muted-foreground" />
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[#0f172a] dark:text-foreground">
            {title}
          </h2>
          <p className="text-sm text-[#64748b] dark:text-muted-foreground max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {actionLabel && onAction && (
          <LockedFeature
            isLocked={actionDisabled}
            reason={actionLockReason}
            variant="disabled"
          >
            <Button
              onClick={onAction}
              disabled={actionDisabled}
              className={cn(
                "gap-2 mt-2",
                actionVariant === "success" &&
                  "bg-[#0f9d58] hover:bg-[#0c7a45] dark:bg-success dark:hover:bg-success-strong"
              )}
              variant={actionVariant === "success" ? "default" : actionVariant}
            >
              {ActionIcon && <ActionIcon className="w-4 h-4" />}
              {actionLabel}
            </Button>
          </LockedFeature>
        )}
      </div>
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height))] p-6">
        {content}
      </div>
    );
  }

  return content;
}
