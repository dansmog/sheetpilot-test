"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { useUserCompanies } from "@/hooks/react-query/hooks";

const POLL_INTERVAL = 2000; // Poll every 2 seconds
const MAX_POLL_TIME = 30000; // Stop polling after 30 seconds

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { width, height } = useWindowSize();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [hasTimedOut, setHasTimedOut] = useState(false);

    const { data: companies = [], refetch } = useUserCompanies();

    // Check if any company has an active subscription
    const checkSubscriptionStatus = useCallback(() => {
        const hasActiveSubscription = companies.some(
            (company) => company.company.subscription_status === "active"
        );
        return hasActiveSubscription;
    }, [companies]);

    useEffect(() => {
        const startTime = Date.now();

        const pollSubscription = async () => {
            // Refetch companies data
            await refetch();

            // Check if subscription is now active
            if (checkSubscriptionStatus()) {
                setIsConfirmed(true);
                setIsVerifying(false);
                // Invalidate queries to ensure fresh data throughout the app
                queryClient.invalidateQueries({ queryKey: ["user-companies"] });
                return;
            }

            // Check if we've exceeded the timeout
            if (Date.now() - startTime >= MAX_POLL_TIME) {
                setHasTimedOut(true);
                setIsVerifying(false);
                // Still invalidate queries in case webhook was delayed
                queryClient.invalidateQueries({ queryKey: ["user-companies"] });
                return;
            }
        };

        // Initial check
        pollSubscription();

        // Set up polling interval
        const intervalId = setInterval(pollSubscription, POLL_INTERVAL);

        return () => clearInterval(intervalId);
    }, [refetch, checkSubscriptionStatus, queryClient]);

    // Auto-redirect when confirmed
    useEffect(() => {
        if (isConfirmed) {
            const redirectTimer = setTimeout(() => {
                router.push("/dashboard/organizations");
            }, 2000); // Redirect after 2 seconds to let user see the success message

            return () => clearTimeout(redirectTimer);
        }
    }, [isConfirmed, router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            {isConfirmed && <Confetti width={width} height={height} />}
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex flex-col items-center justify-center">
                    {isVerifying ? (
                        <>
                            <div className="rounded-full bg-blue-100 p-3 mb-4">
                                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            </div>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                                Verifying Subscription...
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Please wait while we confirm your payment.
                            </p>
                        </>
                    ) : isConfirmed ? (
                        <>
                            <div className="rounded-full bg-green-100 p-3 mb-4">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                                Payment Successful!
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Thank you for your purchase. Your subscription has been activated.
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                Redirecting to dashboard...
                            </p>
                        </>
                    ) : hasTimedOut ? (
                        <>
                            <div className="rounded-full bg-yellow-100 p-3 mb-4">
                                <CheckCircle2 className="h-12 w-12 text-yellow-600" />
                            </div>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                                Payment Received
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Your payment was received. It may take a moment for your subscription to activate.
                            </p>
                        </>
                    ) : null}
                </div>

                <div className="mt-8 space-y-4">
                    <Button
                        asChild
                        className="w-full"
                        size="lg"
                        disabled={isVerifying}
                    >
                        <Link href="/dashboard/organizations">
                            {isVerifying ? "Please wait..." : "Go to Dashboard"}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
