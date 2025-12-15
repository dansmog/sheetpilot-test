"use client";

export default function LocationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-1 flex-col gap-4 p-4 pt-4">{children}</div>;
}
