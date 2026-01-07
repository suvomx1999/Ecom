
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import CartList from '@/app/components/cart-list';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function CartPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
        <p className="mb-4">Please log in to view your cart.</p>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
      return <div>User not found</div>;
  }

  const order = await prisma.order.findFirst({
    where: {
      userId: user.id,
      status: 'PENDING'
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      {!order || order.items.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">Your cart is empty.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Browse Products
          </Link>
        </div>
      ) : (
        <CartList order={order} />
      )}
    </div>
  );
}
