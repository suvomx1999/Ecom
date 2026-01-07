'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tag } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
}

interface ProductFilterProps {
  categories: Category[];
}

export function ProductFilter({ categories }: ProductFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Initialize from URL
  useEffect(() => {
    const cat = searchParams.get('categoryId');
    if (cat) {
      setSelectedCategories(cat.split(','));
    } else {
        setSelectedCategories([]);
    }
  }, [searchParams]);

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }
 
      return newSearchParams.toString();
    },
    [searchParams]
  );

  const applyFilters = () => {
    const params: Record<string, string | number | null> = {};
    
    if (selectedCategories.length > 0) {
        params.categoryId = selectedCategories[0];
    } else {
        params.categoryId = null;
    }

    router.push(`/products?${createQueryString(params)}`);
  };

  const handleCategoryChange = (checked: boolean | string, categoryId: string) => {
      if (checked === true) {
          setSelectedCategories([categoryId]);
      } else {
          setSelectedCategories([]);
      }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4" />
            <h3 className="text-sm font-medium">Categories</h3>
          </div>
          <div className="space-y-2">
              <div className="flex items-center space-x-2">
                  <Checkbox 
                      id="cat-all" 
                      checked={selectedCategories.length === 0}
                      onCheckedChange={(checked) => {
                          if(checked) setSelectedCategories([]);
                      }}
                  />
                  <Label htmlFor="cat-all" className="text-sm font-normal cursor-pointer">All Categories</Label>
              </div>
              {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox 
                          id={`cat-${category.id}`} 
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => handleCategoryChange(checked, category.id)}
                      />
                      <Label htmlFor={`cat-${category.id}`} className="text-sm font-normal cursor-pointer">{category.name}</Label>
                  </div>
              ))}
          </div>
        </div>

        <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
        
        {(searchParams.get('categoryId') || searchParams.get('sort')) && (
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => router.push('/products')}
            >
                Clear All Filters
            </Button>
        )}
      </CardContent>
    </Card>
  );
}
