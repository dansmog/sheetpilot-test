import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import { getLocations } from "@/lib/supabase/locations";

export async function GET(request: Request) {
  try {
    await getAuthUser();
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const activeOnly = searchParams.get("activeOnly") === "true";

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const locations = await getLocations(companyId, activeOnly);

    return NextResponse.json({ locations });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
