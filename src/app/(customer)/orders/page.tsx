import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function OrdersPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login?callbackUrl=/orders');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/auth/login');
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
      status: 'COMPLETED'
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="container py-10 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-muted-foreground mt-2">View and manage your order history.</p>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-12">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-muted rounded-full">
                    <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">No orders yet</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        You haven't placed any orders yet. Start shopping to fill your history!
                    </p>
                </div>
                <Button asChild className="mt-4">
                    <Link href="/">Start Shopping</Link>
                </Button>
            </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
                <div className="bg-muted/40 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Placed</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Amount</p>
                            <p className="text-sm font-bold mt-1">₹{order.total.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700">
                            {order.status}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/orders/${order.id}`}>
                                View Details <ArrowRight className="ml-2 h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </div>
                <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-start gap-4">
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
                                <div className="flex-1 space-y-1">
                                    <h3 className="font-medium text-sm">
                                        <Link href={`/products/${item.product.id}`} className="hover:underline">
                                            {item.product.name}
                                        </Link>
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    <p className="text-sm font-medium">₹{item.price.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
