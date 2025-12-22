import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LockedFeatureProps {
  isLocked: boolean;
  children: React.ReactNode;
  reason?: string;
  upgradeUrl?: string;
  variant?: "inline" | "overlay" | "disabled";
  className?: string;
}

export function LockedFeature({
  isLocked,
  children,
  reason = "This feature requires an active subscription",
  upgradeUrl = "/upgrade",
  variant = "disabled",
  className = "",
}: LockedFeatureProps) {
  // If not locked, render children normally
  if (!isLocked) {
    return <>{children}</>;
  }

  if (variant === "disabled") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`relative ${className}`}>
              <div className="pointer-events-none opacity-50">{children}</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{reason}</p>
            <Link
              href={upgradeUrl}
              className="text-xs text-blue-500 underline mt-1 block"
            >
              Upgrade Now
            </Link>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "inline") {
    return (
      <div className={`relative ${className}`}>
        <div className="opacity-30 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="text-center p-4 max-w-md">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-700 mb-3">{reason}</p>
            <Button asChild size="sm">
              <Link href={upgradeUrl}>Upgrade Now</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div className={`relative min-h-100 ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-lg p-8">
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <Lock className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Feature Locked
          </h3>
          <p className="text-sm text-gray-600 text-center mb-4 max-w-md">
            {reason}
          </p>
          <Button asChild>
            <Link href={upgradeUrl}>Choose a Plan</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
