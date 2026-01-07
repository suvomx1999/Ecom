import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import DeleteProductButton from "@/app/components/delete-product-button";
import ProductFilters from "./product-filters";
import { Prisma } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SellerProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SellerProductsPage({ searchParams }: SellerProductsPageProps) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
  });

  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const categoryId = typeof params.categoryId === 'string' ? params.categoryId : undefined;
  const stock = typeof params.stock === 'string' ? params.stock : undefined;
  const priceRange = typeof params.priceRange === 'string' ? params.priceRange : undefined;

  const where: Prisma.ProductWhereInput = {
      sellerId: user?.id,
  };

  if (search) {
      where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
      ];
  }
  
  if (categoryId) {
      where.categoryId = categoryId;
  }
  
  if (stock === 'in_stock') {
      where.stock = { gt: 0 };
  } else if (stock === 'out_of_stock') {
      where.stock = { lte: 0 };
  }

  if (priceRange) {
      switch (priceRange) {
          case '0-10000':
              where.price = { gte: 0, lte: 10000 };
              break;
          case '10000-100000':
              where.price = { gt: 10000, lte: 100000 };
              break;
          case '100000-1000000':
              where.price = { gt: 100000, lte: 1000000 };
              break;
          case '1000000-plus':
              where.price = { gt: 1000000 };
              break;
      }
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/seller/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      <ProductFilters categories={categories} />

      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    No products found. Start by adding one!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={product.imageUrl || undefined} alt={product.name} />
                          <AvatarFallback>{product.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {product.category?.name || 'Uncategorized'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ₹{product.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {product.stock} in stock
                        </Badge>
                      ) : (
                         <Badge variant="destructive">
                           Out of stock
                         </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/seller/products/${product.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <DeleteProductButton id={product.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
