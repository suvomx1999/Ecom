import { prisma } from '@/lib/prisma';
import ProductForm from '@/app/components/product-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function NewProductPage() {
  const categories = await prisma.category.findMany();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/seller/products">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
      </div>
      
      <ProductForm categories={categories} />
    </div>
  );
}
