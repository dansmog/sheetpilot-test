import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserCompanies } from "@/lib/supabase/companies/queries";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log({ user });

  if (!user) {
    redirect("/auth/login");
  }

  // Get user's companies
  const companies = await getUserCompanies(user.id);

  // If user has no companies, redirect to onboarding
  if (!companies || companies.length === 0) {
    redirect("/onboarding/company");
  }

  // Redirect to the first company's dashboard
  const firstCompany = companies[0];
  redirect(`/dashboard/${firstCompany.company.slug}`);
}
