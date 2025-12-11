import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import {
  getUserProfile,
  updateUserProfile,
} from "@/lib/supabase/users/queries";

export async function GET() {
  try {
    const { user } = await getAuthUser();
    const profile = await getUserProfile(user.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { user } = await getAuthUser();
    const body = await request.json();

    // Ensure email is included in the update
    const updateData = {
      ...body,
      email: user.email,
    };

    const profile = await updateUserProfile(user.id, updateData);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile update error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log({ error });
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
