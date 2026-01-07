import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { address } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order || order.items.length === 0) {
      return new NextResponse('Cart is empty', { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Stripe Checkout Session
    const line_items = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: item.product.imageUrl ? [appUrl + item.product.imageUrl] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
      },
      quantity: item.quantity,
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
      customer_email: user.email,
    });

    // Update order with shipping address and stripe session ID
    // We don't mark it as COMPLETED yet; success page will do that upon verification
    await prisma.order.update({
      where: { id: order.id },
      data: {
        shippingAddress: address,
        stripeSessionId: stripeSession.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error('[CHECKOUT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
