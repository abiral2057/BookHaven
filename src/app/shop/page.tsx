
"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts, Product, getCategories, Category } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(100);
  const [priceRange, setPriceRange] = useState([100]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(fetchedProducts);
        setCategories(
          fetchedCategories.sort((a, b) => a.name.localeCompare(b.name))
        );

        if (fetchedProducts.length > 0) {
          const topPrice = Math.ceil(Math.max(...fetchedProducts.map((p) => p.price)));
          setMaxPrice(topPrice);
          setPriceRange([topPrice]);
        }
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
    setPriceRange([maxPrice]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesPrice = product.price <= priceRange[0];
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, priceRange]);

  const hasActiveFilters =
    searchTerm.length > 0 || selectedCategory !== null || priceRange[0] < maxPrice;

  const FilterSidebarContent = () => (
    <>
      <div className="space-y-8">
        {/* Search Filter */}
        <div>
          <Label htmlFor="search" className="text-lg font-semibold">
            Search
          </Label>
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

        {/* Price Filter */}
        <div>
          <Label htmlFor="price" className="text-lg font-semibold">
            Max Price
          </Label>
          <div className="flex justify-between items-center mt-2 font-medium">
            <span>₹0</span>
            <span>₹{priceRange[0]}</span>
          </div>
          <Slider
            id="price"
            min={0}
            max={maxPrice}
            step={1}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mt-2"
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </>
  );

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
            {/* Filters Sidebar for Desktop */}
            <aside className="hidden lg:block lg:col-span-1 bg-card/50 p-6 rounded-lg self-start sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Filters</h2>
              <FilterSidebarContent />
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Category Filters & Mobile Filter Trigger */}
              <div className="mb-6 flex flex-wrap gap-2 items-center">
                <Button
                  variant={!selectedCategory ? "secondary" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "secondary" : "outline"
                    }
                    onClick={() => setSelectedCategory(category.id)}
                    className="rounded-full"
                  >
                    {category.name}
                  </Button>
                ))}
                 <div className="ml-auto lg:hidden">
                    <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline">
                           <Filter className="mr-2 h-4 w-4"/>
                           Filters
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                            <SheetTitle className="text-2xl">Filters</SheetTitle>
                        </SheetHeader>
                        <div className="p-4">
                            <FilterSidebarContent />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-card/50 p-4 rounded-lg animate-pulse"
                    >
                      <div className="bg-muted h-60 w-full rounded-md"></div>
                      <div className="mt-4 h-6 w-3/4 bg-muted rounded"></div>
                      <div className="mt-2 h-4 w-1/2 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 col-span-full bg-card/50 rounded-lg">
                  <BookOpen className="mx-auto h-16 w-16 text-muted-foreground" />
                  <h3 className="mt-4 text-xl font-semibold">
                    No Books Found
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    Try adjusting your search or filters.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={clearFilters}
                  >
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
