import { NextResponse } from "next/server";
import { getAuthUser } from "@/utils";
import {
  getLocations,
  createLocation,
  CreateLocationData,
} from "@/lib/supabase/locations/queries";
import { addLocationSchema } from "@/utils/validation-schemas/location.schema";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = addLocationSchema.parse(body);
    const locationData: CreateLocationData = {
      company_id: validatedData.company_id,
      name: validatedData.name,
      slug: validatedData.slug,
      description: validatedData.description || null,
      address: validatedData.address || null,
      timezone: validatedData.timezone,
      is_active: validatedData.is_active,
    };

    const location = await createLocation(locationData);

    return NextResponse.json({ location }, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to create location" },
      { status: 400 }
    );
  }
}
