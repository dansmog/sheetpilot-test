import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // If there's an error, redirect to verify-email page with error
  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/verify-email?error=${error}&error_description=${error_description || ""}`,
        requestUrl.origin
      )
    );
  }

  // If no code, redirect to login
  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
  }

  try {
    const supabase = await createClient();

    // Exchange the code for a session
    const { data, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError);
      return NextResponse.redirect(
        new URL(
          `/auth/verify-email?error=exchange_failed&error_description=${encodeURIComponent(exchangeError.message)}`,
          requestUrl.origin
        )
      );
    }

    if (!data.session) {
      return NextResponse.redirect(
        new URL(
          "/auth/verify-email?error=no_session&error_description=No session created",
          requestUrl.origin
        )
      );
    }

    // Redirect to verify-email page with success indicator
    return NextResponse.redirect(
      new URL("/auth/verify-email?verified=true", requestUrl.origin)
    );
  } catch (error) {
    console.error("Unexpected error during code exchange:", error);
    return NextResponse.redirect(
      new URL(
        `/auth/verify-email?error=unexpected&error_description=${encodeURIComponent(error instanceof Error ? error.message : "Unknown error")}`,
        requestUrl.origin
      )
    );
  }
}
