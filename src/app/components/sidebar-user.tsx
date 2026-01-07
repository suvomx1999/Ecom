import Link from "next/link";
import LogoutButton from "@/app/components/logout-button";
import { User } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarUserProps {
  user: User;
  profileLink: string;
}

export default function SidebarUser({ user, profileLink }: SidebarUserProps) {
  return (
    <div className="border-t p-4">
      <Link href={profileLink} className="flex items-center gap-3 mb-4 group">
        <Avatar>
          <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
          <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 group-hover:text-gray-700 truncate">{user.email}</p>
        </div>
      </Link>
      <LogoutButton className="w-full justify-start pl-0 text-gray-600 hover:text-red-600 hover:bg-transparent flex items-center text-sm" />
    </div>
  );
}
