import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, UserCircle } from "lucide-react";
import SidebarUser from "@/app/components/sidebar-user";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/seller/dashboard" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span className="">Seller Hub</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/seller/dashboard">
               <LayoutDashboard className="h-5 w-5 mr-3" />
               Dashboard
            </Link>
          </Button>
          <Button asChild variant="ghost" className="w-full justify-start">
             <Link href="/seller/products">
               <Package className="h-5 w-5 mr-3" />
               Products
             </Link>
          </Button>
           <Button asChild variant="ghost" className="w-full justify-start">
             <Link href="/seller/profile">
               <UserCircle className="h-5 w-5 mr-3" />
               Profile
             </Link>
          </Button>
        </nav>
        {session?.user && <SidebarUser user={session.user} profileLink="/seller/profile" />}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
