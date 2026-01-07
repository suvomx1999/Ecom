'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category } from "@prisma/client";
import { useTransition, useState, useEffect } from "react";

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");

  // Update local state when URL changes
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || "");
  }, [searchParams]);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page to 1 if we had pagination (not implemented yet, but good practice)
    
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
      updateFilters('search', searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
          handleSearchSubmit();
      }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
       <div className="w-full sm:w-[300px]">
         <Input 
            placeholder="Search products (Press Enter)..." 
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onBlur={handleSearchSubmit}
         />
       </div>
       <Select defaultValue={searchParams.get('categoryId') || "all"} onValueChange={(val) => updateFilters('categoryId', val === 'all' ? null : val)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
       </Select>
       
       <Select defaultValue={searchParams.get('priceRange') || "all"} onValueChange={(val) => updateFilters('priceRange', val === 'all' ? null : val)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Price Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Prices</SelectItem>
            <SelectItem value="0-10000">₹0 - ₹10,000</SelectItem>
            <SelectItem value="10000-100000">₹10,000 - ₹1,00,000</SelectItem>
            <SelectItem value="100000-1000000">₹1,00,000 - ₹10,00,000</SelectItem>
            <SelectItem value="1000000-plus">Above ₹10,00,000</SelectItem>
          </SelectContent>
       </Select>

       <Select defaultValue={searchParams.get('stock') || "all"} onValueChange={(val) => updateFilters('stock', val === 'all' ? null : val)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Stock Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
       </Select>
    </div>
  );
}
