import { prisma } from "@/lib/prisma";
import ProductCard from "@/app/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function CustomerHomePage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
    }),
    prisma.category.findMany()
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-muted/50 py-24 md:py-32 overflow-hidden">
        <div className="container relative z-10 flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Elevate Your Shopping <br className="hidden sm:inline" />
                <span className="text-primary">Experience</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                Discover a curated collection of premium products designed to enhance your lifestyle. 
                Quality meets affordability in every item.
            </p>
            <div className="mt-10 flex gap-4">
                <Button size="lg" asChild>
                    <Link href="#products">Shop Now</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="#">Learn More</Link>
                </Button>
            </div>
        </div>
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="py-12 bg-background border-b">
            <div className="container">
                <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((cat) => (
                        <Link href={`/products?categoryId=${cat.id}`} key={cat.id} className="group block h-full">
                            <Card className="h-full hover:border-primary hover:shadow-md transition-all duration-300">
                                <CardContent className="flex flex-col items-center justify-center h-32 p-6 text-center">
                                    <span className="font-semibold text-lg group-hover:text-primary transition-colors">{cat.name}</span>
                                    {cat.description && (
                                        <span className="text-xs text-muted-foreground mt-2 line-clamp-2">{cat.description}</span>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
      )}

      {/* Products Section */}
      <section id="products" className="py-16 bg-background">
        <div className="container">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
                    <p className="text-muted-foreground mt-2">Explore our latest arrivals and best sellers.</p>
                </div>
                <Button variant="ghost" asChild className="hidden sm:flex">
                    <Link href="/products" className="group">
                        View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24">
                    <h3 className="text-lg font-medium">No products found</h3>
                    <p className="text-muted-foreground">Check back later for new arrivals.</p>
                </div>
            )}
            
            <div className="mt-12 text-center sm:hidden">
                 <Button variant="outline" asChild>
                    <Link href="/products">View All Products</Link>
                </Button>
            </div>
        </div>
      </section>
    </div>
  );
}
