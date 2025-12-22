"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface OverageWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  resourceType: "location" | "employee";
  currentCount: number | undefined;
  planLimit: number;
  overageCost: number;
  planName: string;
}

export function OverageWarningModal({
  isOpen,
  onClose,
  onConfirm,
  resourceType,
  currentCount,
  planLimit,
  overageCost,
  planName,
}: OverageWarningModalProps) {
  if (currentCount == undefined) {
    return;
  }
  const exceededBy = currentCount - planLimit + 1;
  const totalOverageCost = exceededBy * overageCost;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <DialogTitle>Plan Limit Reached</DialogTitle>
          </div>
          <div className="text-left pt-4">
            <div className="space-y-3">
              <p>
                You&apos;re about to exceed the {resourceType} limit for your{" "}
                <span className="font-semibold">{planName}</span> plan.
              </p>

              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan limit:</span>
                  <span className="font-medium">
                    {planLimit} {resourceType}
                    {planLimit > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current usage:</span>
                  <span className="font-medium">
                    {currentCount} {resourceType}
                    {currentCount > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="text-gray-600">Additional charge:</span>
                  <span className="font-semibold text-brand-2">
                    €{overageCost.toFixed(2)} per {resourceType}
                  </span>
                </div>
              </div>

              <p className="text-sm">
                By continuing, you&apos;ll be charged{" "}
                <span className="font-semibold text-brand-2">
                  €{totalOverageCost.toFixed(2)}
                </span>{" "}
                {exceededBy > 1 ? `(€${overageCost} × ${exceededBy})` : ""} for
                every new {resourceType} added
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant={"default"} className="ml-2">
            Continue & Accept Charges
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
