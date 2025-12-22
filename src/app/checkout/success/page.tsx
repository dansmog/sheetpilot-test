"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { width, height } = useWindowSize()

    useEffect(() => {
        // Invalidate the user-companies query to force a refetch
        // This ensures the dashboard reflects the new subscription status immediately
        queryClient.invalidateQueries({ queryKey: ["user-companies"] });
    }, [queryClient]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Confetti width={width}
                height={height} />
            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="rounded-full bg-green-100 p-3 mb-4">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                        Payment Successful!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Thank you for your purchase. Your subscription has been activated.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <Button asChild className="w-full" size="lg">
                        <Link href="/dashboard/organizations">Go to Dashboard</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
