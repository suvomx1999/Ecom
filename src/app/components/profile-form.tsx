'use client';

import { useActionState } from 'react';
import { updateProfile } from '@/app/lib/actions';
import { User } from 'next-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ProfileFormProps {
  user: User & {
    role?: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, { message: '' });

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              name="name"
              id="name"
              defaultValue={user.name || ''}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              type="email"
              name="email"
              id="email"
              defaultValue={user.email || ''}
              disabled
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              placeholder="Leave blank to keep current password"
            />
          </div>
          
          <div className="space-y-2">
             <Label>Role</Label>
             <div className="px-3 py-2 bg-muted border rounded-md text-sm text-muted-foreground">
               {user.role}
             </div>
          </div>
          
          {state.message && (
            <div className={`text-sm font-medium ${state.message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
              {state.message}
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-muted/50 px-6 py-4 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
