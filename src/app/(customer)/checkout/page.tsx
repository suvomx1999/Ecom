import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckoutForm } from './checkout-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/checkout');
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    redirect('/auth/login');
  }

  const order = await prisma.order.findFirst({
    where: {
      userId: user.id,
      status: 'PENDING'
    },
    include: { items: { include: { product: true } } }
  });

  if (!order || order.items.length === 0) {
    redirect('/cart');
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Link href="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <CheckoutForm order={order} />
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 bg-muted rounded-md overflow-hidden relative shrink-0 border">
                       {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt={item.product.name} className="object-cover h-full w-full" />
                       ) : (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">No Img</div>
                       )}
                    </div>
                    <div className="flex flex-1 justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Free</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
