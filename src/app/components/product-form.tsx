'use client';

import { useActionState, useState } from 'react';
import { createProduct } from '@/app/lib/actions';
import { Category } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(createProduct, { message: '' });
  const [categoryId, setCategoryId] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Product</CardTitle>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input type="text" name="name" id="name" required placeholder="e.g. Premium Wireless Headphones" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" id="description" required placeholder="Describe your product..." rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input type="number" name="price" id="price" step="0.01" required placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input type="number" name="stock" id="stock" required placeholder="0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={setCategoryId} required>
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
                onChange={() => {}} // Suppress warning
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <Input type="file" name="image" id="image" accept="image/*" className="cursor-pointer" />
          </div>

          {state.message && (
            <p className={`text-sm font-medium ${state.message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {state.message}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating...' : 'Create Product'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
