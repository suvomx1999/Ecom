import Link from 'next/link';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect('/');
  }

  let isSuccess = false;
  let message = '';

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order) {
          if (order.status === 'COMPLETED') {
            isSuccess = true;
          } else if (order.status === 'PENDING') {
            // Process order completion
            try {
              await prisma.$transaction(async (tx) => {
                // 1. Decrement stock
                for (const item of order.items) {
                  await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                  });
                }

                // 2. Update order status
                await tx.order.update({
                  where: { id: orderId },
                  data: {
                    status: 'COMPLETED',
                    stripeSessionId: session.id
                  }
                });
              });
              isSuccess = true;
            } catch (err) {
              console.error("Transaction failed:", err);
              message = "Failed to process order. Please contact support.";
            }
          }
        } else {
            message = "Order not found.";
        }
      } else {
        message = "Invalid order details.";
      }
    } else {
      message = "Payment was not successful.";
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    message = "Unable to verify payment. Please check your Stripe configuration.";
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader className="pb-2">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {isSuccess ? (
                        <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    ) : (
                        <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    )}
                </div>
                <CardTitle className="text-2xl">{isSuccess ? "Order Confirmed!" : "Payment Failed"}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {isSuccess 
                        ? "Thank you for your purchase. We have received your order and will process it shortly."
                        : (message || "There was an issue processing your payment.")}
                </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" asChild>
                    <Link href="/orders">View Your Orders <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/">Return to Home</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
