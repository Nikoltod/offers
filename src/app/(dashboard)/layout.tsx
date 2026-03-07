import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/server/auth/options";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
