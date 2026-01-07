import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Truck, ShieldCheck } from "lucide-react";
import AddToCartButton from "@/app/components/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, seller: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="container py-10 px-4 md:px-6">
        <div className="mb-6">
            <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                <Link href="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to shopping
                </Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="flex flex-col gap-4">
                <div className="aspect-square bg-muted rounded-xl overflow-hidden relative border shadow-sm">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-center object-cover hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image Available
                        </div>
                    )}
                </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="font-normal">
                            {product.category?.name || 'Uncategorized'}
                        </Badge>
                        {product.stock > 0 ? (
                            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                In Stock
                            </span>
                        ) : (
                            <span className="text-xs font-medium text-destructive flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                                Out of Stock
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{product.name}</h1>
                    <div className="mt-2 flex items-center gap-4">
                        <p className="text-2xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                    </p>
                </div>

                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback>{product.seller.name?.[0]?.toUpperCase() || "S"}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">Sold by {product.seller.name || "Unknown Seller"}</p>
                        <p className="text-xs text-muted-foreground">Member since {new Date(product.seller.createdAt).getFullYear()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Free Shipping</p>
                            <p className="text-xs text-muted-foreground">On orders over ₹5000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="font-medium">2 Year Warranty</p>
                            <p className="text-xs text-muted-foreground">Full coverage</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                    <AddToCartButton productId={product.id} disabled={product.stock <= 0} />
                    <p className="text-xs text-muted-foreground text-center">
                        Sold by <span className="font-medium text-foreground">{product.seller.name}</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
