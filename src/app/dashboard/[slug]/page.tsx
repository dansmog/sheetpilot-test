"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CompanyIndexPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    if (slug === "organizations") {
      return;
    }

    if (slug) {
      router.replace(`/dashboard/${slug}/locations`);
    }
  }, [slug, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
