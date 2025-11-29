import Image from "next/image";
import Logo from "../../images/logo.svg";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center auth-wrapper">
      <div className="max-w-md w-full">
        <div className="bg-white w-[420px] mx-auto p-5 rounded-lg">
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
