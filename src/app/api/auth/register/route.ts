import { NextResponse } from "next/server";
import { registerUser } from "@/lib/supabase/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    const { user, error } = await registerUser(email, password, fullName);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Registration failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        user: {
          id: user?.id,
          email: user?.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration" },
      { status: 500 }
    );
  }
}
