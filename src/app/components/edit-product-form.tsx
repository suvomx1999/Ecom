'use client';

import { useActionState, useState } from 'react';
import { updateProduct } from '@/app/lib/actions';
import { Category, Product } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface EditProductFormProps {
  categories: Category[];
  product: Product;
}

export default function EditProductForm({ categories, product }: EditProductFormProps) {
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(updateProductWithId, { message: '' });
  const [categoryId, setCategoryId] = useState(product.categoryId || '');

  return (
    <Card>
       <CardHeader>
          <CardTitle>Edit Product</CardTitle>
       </CardHeader>
       <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input type="text" name="name" id="name" defaultValue={product.name} required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" id="description" rows={4} defaultValue={product.description} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label htmlFor="price">Price ($)</Label>
               <Input type="number" name="price" id="price" step="0.01" defaultValue={product.price} required />
            </div>

            <div className="space-y-2">
               <Label htmlFor="stock">Stock</Label>
               <Input type="number" name="stock" id="stock" defaultValue={product.stock} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={setCategoryId} defaultValue={categoryId} required>
               <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
               </SelectTrigger>
               <SelectContent>
                  {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
               </SelectContent>
            </Select>
            <input 
                type="text" 
                name="categoryId" 
                value={categoryId} 
                required 
                className="sr-only" 
                tabIndex={-1}
                onChange={() => {}} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            {product.imageUrl && (
               <div className="mb-4 relative h-32 w-32 rounded-md overflow-hidden border bg-muted">
                   <img src={product.imageUrl} alt="Current product" className="object-cover w-full h-full" />
               </div>
            )}
            <Input type="file" name="image" id="image" accept="image/*" className="cursor-pointer" />
            <p className="text-xs text-muted-foreground">Leave blank to keep current image</p>
          </div>

          {state.message && (
            <p className={`text-sm font-medium ${state.message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {state.message}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
                <Link href="/seller/products">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
