import { prisma } from '@/lib/prisma';
import EditProductForm from '@/app/components/edit-product-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id },
    include: { seller: true },
  });

  if (!product) {
    notFound();
  }

  // Ensure seller owns the product
  if (product.seller.email !== session?.user?.email) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Unauthorized</h2>
        <p className="text-muted-foreground">You do not have permission to edit this product.</p>
        <Button variant="link" asChild>
          <Link href="/seller/products">
            Return to Products
          </Link>
        </Button>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
      </div>
      
      <EditProductForm categories={categories} product={product} />
    </div>
  );
}
