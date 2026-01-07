'use client';

import { removeFromCart, updateCartQuantity } from '@/app/lib/actions';
import { useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CartList({ order }: { order: any }) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      await removeFromCart(itemId);
    });
  };

  const handleQuantityChange = (itemId: string, newQuantity: string) => {
    const qty = parseInt(newQuantity, 10);
    if (qty < 1) return;
    startTransition(async () => {
      await updateCartQuantity(itemId, qty);
    });
  };

  const total = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8 space-y-4">
        {order.items.map((item: any) => (
          <Card key={item.id} className="flex flex-col sm:flex-row overflow-hidden">
            <div className="sm:w-32 sm:h-32 w-full h-48 bg-muted relative shrink-0">
               {item.product.imageUrl ? (
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
               ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Image</div>
               )}
            </div>
            <div className="flex flex-1 flex-col justify-between p-4">
               <div className="flex justify-between items-start">
                   <div>
                       <h3 className="font-semibold text-lg line-clamp-1">
                           <Link href={`/products/${item.product.id}`} className="hover:underline">
                               {item.product.name}
                           </Link>
                       </h3>
                       <p className="text-sm text-muted-foreground">Unit Price: ${item.price.toFixed(2)}</p>
                   </div>
                   <p className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
               </div>
               
               <div className="flex items-center justify-between mt-4 sm:mt-0">
                   <div className="flex items-center gap-2">
                       <span className="text-sm font-medium">Qty:</span>
                       <div className="flex items-center border rounded-md">
                           <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-8 w-8 rounded-none rounded-l-md" 
                               onClick={() => handleQuantityChange(item.id, (item.quantity - 1).toString())}
                               disabled={isPending || item.quantity <= 1}
                           >
                               <Minus className="h-3 w-3" />
                           </Button>
                           <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                           <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-8 w-8 rounded-none rounded-r-md" 
                               onClick={() => handleQuantityChange(item.id, (item.quantity + 1).toString())}
                               disabled={isPending}
                           >
                               <Plus className="h-3 w-3" />
                           </Button>
                       </div>
                   </div>
                   <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(item.id)}
                        disabled={isPending}
                   >
                       <Trash2 className="h-4 w-4 mr-2" />
                       Remove
                   </Button>
               </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-4">
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">
                        Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
