"use client";

import * as React from "react";
import { AlertCircle, Lock, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerProps {
  children: React.ReactNode;
  variant?: "info" | "warning" | "upgrade" | "success";
  className?: string;
}

const variantStyles = {
  info: {
    container: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    text: "text-blue-900 dark:text-blue-100",
    Icon: Info,
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
    icon: "text-yellow-600 dark:text-yellow-400",
    text: "text-yellow-900 dark:text-yellow-100",
    Icon: AlertCircle,
  },
  upgrade: {
    container: "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400",
    text: "text-purple-900 dark:text-purple-100",
    Icon: Lock,
  },
  success: {
    container: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    text: "text-green-900 dark:text-green-100",
    Icon: CheckCircle,
  },
};

export function Banner({ children, variant = "info", className }: BannerProps) {
  const styles = variantStyles[variant];
  const Icon = styles.Icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        styles.container,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", styles.icon)} />
      <div className={cn("flex-1 text-sm", styles.text)}>{children}</div>
    </div>
  );
}
