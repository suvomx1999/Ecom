'use client';

import { addToCart } from '@/app/lib/actions';
import { useTransition } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddToCartButton({ productId, disabled }: { productId: string, disabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleAddToCart = () => {
    startTransition(async () => {
      const result = await addToCart(productId);
      if (result.message) {
        alert(result.message); // TODO: Replace with Toast
      }
    });
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isPending}
      className="w-full sm:w-auto"
      size="lg"
    >
      {isPending ? 'Adding...' : (
        <>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to cart
        </>
      )}
    </Button>
  );
}
