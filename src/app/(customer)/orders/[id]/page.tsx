import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Package } from 'lucide-react';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  
  if (!session?.user?.email) {
    redirect(`/auth/login?callbackUrl=/orders/${id}`);
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/auth/login');
  }

  const order = await prisma.order.findUnique({
    where: {
      id: id,
      userId: user.id
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container py-10 px-4 md:px-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
            <Link href="/orders" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
            </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Order #{order.id.slice(-8).toUpperCase()}</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </p>
            </div>
            <Badge variant="outline" className="w-fit border-green-200 bg-green-50 text-green-700">
                {order.status}
            </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                    {item.product.imageUrl ? (
                                        <img
                                            src={item.product.imageUrl}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover object-center"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                            No Img
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="font-medium text-sm">
                                            <Link href={`/products/${item.product.id}`} className="hover:underline">
                                                {item.product.name}
                                            </Link>
                                        </h3>
                                        <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="text-muted-foreground">Free</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>₹{order.total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>

                {order.shippingAddress && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {order.shippingAddress}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
