import { auth } from "@/auth";
import ProfileForm from "@/app/components/profile-form";
import { redirect } from "next/navigation";

export default async function SellerProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">My Profile</h1>
      <ProfileForm user={session.user} />
    </div>
  );
}
