'use client';

import { deleteUser } from '@/app/lib/actions';
import { useTransition } from 'react';

export function DeleteUser({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this user?')) {
      startTransition(async () => {
        try {
          await deleteUser(userId);
        } catch (error) {
          console.error('Failed to delete user:', error);
          alert('Failed to delete user');
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </button>
  );
}
