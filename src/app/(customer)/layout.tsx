import { Navbar } from "@/app/components/navbar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let cartItemCount = 0;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      const order = await prisma.order.findFirst({
        where: { userId: user.id, status: 'PENDING' },
        include: { items: true }
      });
      if (order) {
        cartItemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);
      }
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <Navbar user={session?.user} cartItemCount={cartItemCount} />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by Suvo. The source code is available on GitHub.
          </p>
        </div>
      </footer>
    </div>
  );
}
