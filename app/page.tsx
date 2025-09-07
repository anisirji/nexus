import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthButton from "@/components/AuthButton";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/workspace");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="absolute top-4 right-4">
        <AuthButton />
      </div>
      <h1 className="text-4xl font-bold">Nexus - AI Workspace Assistant</h1>
      <p className="mt-4 text-lg text-gray-600">Your AI-powered Google Workspace assistant</p>
      <p className="mt-8 text-sm text-gray-500">Sign in with Google to access your workspace</p>
    </main>
  );
}