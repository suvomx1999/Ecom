import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SellerDashboardPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { email: session?.user?.email! } });
  
  if (!user) {
      return <div>User not found</div>;
  }

  const [productsCount, orderItems] = await Promise.all([
      prisma.product.count({ where: { sellerId: user.id } }),
      prisma.orderItem.findMany({
        where: { product: { sellerId: user.id } },
        include: { order: true, product: true },
        orderBy: { order: { createdAt: 'desc' } }
      })
  ]);

  const totalRevenue = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalOrders = new Set(orderItems.map(item => item.orderId)).size;
  
  // Recent sales (last 5 items sold)
  const recentSales = orderItems.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
           <Button asChild>
             <Link href="/seller/products/new">Add Product</Link>
           </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="text-xs text-muted-foreground">
              Active products listed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Total orders received
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSales.length > 0 ? (
                  recentSales.map((item) => (
                      <div className="flex items-center" key={item.id}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Order #{item.orderId.slice(-6)}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          +₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                  ))
              ) : (
                  <p className="text-sm text-muted-foreground">No recent sales.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
             <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="grid gap-4">
                 <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/seller/products">
                        <Package className="mr-2 h-4 w-4" />
                        Manage Products
                    </Link>
                 </Button>
                 <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/seller/profile">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Profile
                    </Link>
                 </Button>
             </CardContent>
        </Card>
      </div>
    </div>
  );
}
