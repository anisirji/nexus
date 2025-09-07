import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import WorkspaceLayout from "@/components/WorkspaceLayout";

export default async function WorkspacePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return <WorkspaceLayout user={session.user} />;
}