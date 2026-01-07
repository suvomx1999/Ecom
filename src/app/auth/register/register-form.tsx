'use client';

import { useActionState } from 'react';
import { register } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

export default function RegisterForm() {
  const [state, dispatch, isPending] = useActionState(register, undefined);

  const handleSubmit = (payload: FormData) => {
    dispatch(payload);
  };

  return (
    <form className="space-y-4" action={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="role">I want to be a</Label>
        <Select name="role" defaultValue="CUSTOMER" required>
            <SelectTrigger>
                <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
                <SelectItem value="SELLER">Seller</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            placeholder="Create a password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Creating account...' : 'Create account'}
      </Button>
      
      {state?.message && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/15 rounded-md" aria-live="polite">
            <AlertCircle className="h-4 w-4" />
            <p>{state.message}</p>
        </div>
      )}
    </form>
  );
}
