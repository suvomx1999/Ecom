import Link from "next/link";
import { LayoutDashboard, Users, Settings, UserCircle } from "lucide-react";
import SidebarUser from "@/app/components/sidebar-user";
import { auth } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md relative">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="mt-6 pb-24">
          <Link href="/admin/dashboard" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
            <Users className="h-5 w-5 mr-3" />
            Users
          </Link>
          <Link href="/admin/profile" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
            <UserCircle className="h-5 w-5 mr-3" />
            Profile
          </Link>
        </nav>
        {session?.user && <SidebarUser user={session.user} profileLink="/admin/profile" />}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
