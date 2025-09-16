
"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts, Product, getCategories, Category } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch products or categories.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const clearFilters = () => {
      setSearchTerm("");
      setSelectedCategory(null);
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);
  
  const hasActiveFilters = searchTerm.length > 0 || selectedCategory !== null;

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Our Collection
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Explore a world of stories, knowledge, and adventure.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1 bg-card/50 p-6 rounded-lg self-start sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Filters</h2>
              <div className="space-y-6">
                {/* Search Filter */}
                <div>
                  <Label htmlFor="search" className="text-lg font-semibold">Search</Label>
                  <div className="relative mt-2">
                    <Input
                      id="search"
                      placeholder="Title or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                 {hasActiveFilters && (
                    <Button variant="ghost" onClick={clearFilters} className="w-full">
                        <X className="mr-2 h-4 w-4"/>
                        Clear Filters
                    </Button>
                )}
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
               {/* Category Filters */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                   <Button 
                      variant={!selectedCategory ? 'secondary' : 'outline'}
                      onClick={() => setSelectedCategory(null)}
                    >
                      All
                    </Button>
                  {categories.map((category) => (
                    <Button 
                      key={category.id} 
                      variant={selectedCategory === category.id ? 'secondary' : 'outline'}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                     <div key={i} className="bg-card/50 p-4 rounded-lg animate-pulse">
                        <div className="bg-muted h-48 w-full rounded-md"></div>
                        <div className="mt-4 h-6 w-3/4 bg-muted rounded"></div>
                        <div className="mt-2 h-4 w-1/2 bg-muted rounded"></div>
                     </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 col-span-full bg-card/50 rounded-lg">
                    <BookOpen className="mx-auto h-16 w-16 text-muted-foreground"/>
                    <h3 className="mt-4 text-xl font-semibold">No Books Found</h3>
                    <p className="mt-2 text-muted-foreground">
                        Try adjusting your search or filters.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={clearFilters}>
                        Reset All Filters
                    </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
