'use client';

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const [errorMessage, dispatch, isPending] = useActionState(
    authenticate,
    undefined
  );

  const handleSubmit = (payload: FormData) => {
    dispatch(payload);
  };

  return (
    <form className="space-y-4" action={handleSubmit}>
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
        <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
            </Link>
        </div>
        <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="remember-me" name="remember-me" />
        <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground">Remember me</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
      </Button>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/15 rounded-md" aria-live="polite">
            <AlertCircle className="h-4 w-4" />
            <p>{errorMessage}</p>
        </div>
      )}
    </form>
  );
}
