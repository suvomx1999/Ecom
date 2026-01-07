'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
}

export default function LogoutButton({ className, showIcon = true }: LogoutButtonProps) {
  const handleLogout = async () => {
    try {
      await signOut({ redirectTo: '/' });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "flex items-center text-gray-700 hover:text-red-600 w-full"}
    >
      {showIcon && <LogOut className="h-5 w-5 mr-3" />}
      Logout
    </button>
  );
}
