import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Logo from "../../images/logo.svg";
import { getUserPrimaryCompany } from "@/lib/supabase/companies/queries";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  try {
    const primaryCompany = await getUserPrimaryCompany(user.id);
    if (primaryCompany?.company?.slug) {
      redirect(`/dashboard/${primaryCompany.company.slug}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error("Error fetching company:", error);
    redirect("/auth/login");
  }
  return (
    <div className="min-h-screen flex items-center justify-center auth-wrapper">
      <div className="max-w-md w-full">
        <div className="bg-white w-105 mx-auto p-5 rounded-lg">
          <header className="w-full flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-1">
              <Image src={Logo} alt="SheetPilot Logo" className="h-5 w-auto" />
              <h1 className="text-lg tracking-tight font-medium">SheetPilot</h1>
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
