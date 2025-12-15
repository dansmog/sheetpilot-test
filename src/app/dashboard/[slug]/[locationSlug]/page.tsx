"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function LocationIndexPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const locationSlug = params.locationSlug as string;

  useEffect(() => {
    // Redirect to the overview page as the default location page
    if (slug && locationSlug) {
      router.replace(`/dashboard/${slug}/${locationSlug}/overview`);
    }
  }, [slug, locationSlug, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
        <p className="mt-4 text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
