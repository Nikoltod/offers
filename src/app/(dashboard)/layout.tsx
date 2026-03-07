import { requireUserSession } from "@/server/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUserSession();

  return <>{children}</>;
}
