import { prisma } from "@/lib/prisma";
import ProductCard from "@/app/components/product-card";
import { ProductFilter } from "@/app/components/product-filter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categoryId = params.categoryId as string | undefined;
  const sort = params.sort as string | undefined;

  const where: any = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const orderBy: any = {};
  if (sort === 'price_asc') orderBy.price = 'asc';
  else if (sort === 'price_desc') orderBy.price = 'desc';
  else orderBy.createdAt = 'desc';

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: true },
  });

  const categories = await prisma.category.findMany();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter */}
        <div className="lg:hidden mb-4">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <ProductFilter categories={categories} />
                </SheetContent>
            </Sheet>
        </div>

        {/* Desktop Filter */}
        <aside className="hidden lg:block w-64 shrink-0">
             <ProductFilter categories={categories} />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.length > 0 ? (
                    products.map(p => <ProductCard key={p.id} product={p} />)
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No products found matching your criteria.
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
}
