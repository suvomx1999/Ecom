import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product, Category } from "@prisma/client";

interface ProductCardProps {
  product: Product & { category: Category | null };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            No Image
          </div>
        )}
        {product.stock <= 0 && (
           <div className="absolute top-2 right-2">
             <Badge variant="destructive">Out of Stock</Badge>
           </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
            <div>
                 <p className="text-sm text-muted-foreground mb-1">{product.category?.name || 'Uncategorized'}</p>
                <CardTitle className="text-lg line-clamp-1" title={product.name}>
                <Link href={`/products/${product.id}`} className="hover:underline">
                    {product.name}
                </Link>
                </CardTitle>
            </div>
             <span className="text-lg font-bold">₹{product.price.toFixed(2)}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full" disabled={product.stock <= 0} variant={product.stock <= 0 ? "secondary" : "default"}>
          <Link href={`/products/${product.id}`}>
             {product.stock > 0 ? "View Details" : "Unavailable"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
