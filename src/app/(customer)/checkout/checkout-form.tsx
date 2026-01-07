'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CreditCard } from 'lucide-react';

export function CheckoutForm({ order }: { order: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const address = formData.get('address') as string;

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Something went wrong');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Shipping & Payment</CardTitle>
        </CardHeader>
        <CardContent>
            <form id="checkout-form" onSubmit={onCheckout} className="space-y-6">
                {error && (
                    <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                        id="address"
                        name="address"
                        rows={3}
                        required
                        placeholder="123 Main St, City, Country"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <div className="p-4 border rounded-md bg-muted/50 flex items-center gap-4">
                        <CreditCard className="h-6 w-6 text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Stripe Secure Payment</p>
                            <p className="text-xs text-muted-foreground">You will be redirected to Stripe to complete your purchase.</p>
                        </div>
                    </div>
                </div>
            </form>
        </CardContent>
        <CardFooter className="flex-col space-y-4">
            <Button 
                type="submit" 
                form="checkout-form"
                className="w-full" 
                size="lg"
                disabled={loading}
            >
                {loading ? 'Processing...' : `Pay ₹${order.total.toFixed(2)}`}
            </Button>
        </CardFooter>
    </Card>
  );
}
