import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    return supabaseResponse;
  }

  // Protected routes that require authentication
  const isOnboardingRoute = request.nextUrl.pathname.startsWith("/onboarding");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/auth");

  // Redirect unauthenticated users trying to access protected routes
  // if (!user && (isOnboardingRoute || isDashboardRoute)) {
  //   const url = request.nextUrl.clone();
  //   url.pathname = "/auth/login";
  //   return NextResponse.redirect(url);
  // }

  // For authenticated users
  if (user) {
    if (isAuthRoute) {
      try {
        // Dynamic import to avoid circular dependencies
        const { getUserPrimaryCompany } = await import(
          "@/lib/supabase/companies/queries"
        );
        const primaryCompany = await getUserPrimaryCompany(user.id);

        const url = request.nextUrl.clone();
        if (primaryCompany?.company?.slug) {
          url.pathname = `/dashboard/${primaryCompany.company.slug}`;
        } else {
          url.pathname = "/onboarding/company";
        }
        return NextResponse.redirect(url);
      } catch (error) {
        console.error("Error checking user company:", error);
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding/company";
        return NextResponse.redirect(url);
      }
    }

    // Verify dashboard slug access
    if (isDashboardRoute) {
      const pathname = request.nextUrl.pathname;

      // Skip verification for organizations page
      if (pathname === "/dashboard/organizations") {
        return supabaseResponse;
      }

      const slugMatch = pathname.match(/^\/dashboard\/([^\/]+)/);

      if (slugMatch) {
        const slug = slugMatch[1];

        try {
          const { getUserCompanies } = await import(
            "@/lib/supabase/companies/queries"
          );
          const companies = await getUserCompanies(user.id);

          const hasAccess = companies.some((c) => c.company.slug === slug);

          if (!hasAccess) {
            // User doesn't have access to this company
            const url = request.nextUrl.clone();
            const primaryCompany = companies[0];

            if (primaryCompany?.company?.slug) {
              url.pathname = `/dashboard/${primaryCompany.company.slug}`;
            } else {
              url.pathname = "/onboarding/company";
            }
            return NextResponse.redirect(url);
          }
        } catch (error) {
          console.error("Error verifying dashboard access:", error);
          // On error, allow access (fail open for better UX)
        }
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
