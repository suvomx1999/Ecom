import { auth } from "@/auth";
import ProfileForm from "@/app/components/profile-form";
import { redirect } from "next/navigation";

export default async function CustomerProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>
      <ProfileForm user={session.user} />
    </div>
  );
}
