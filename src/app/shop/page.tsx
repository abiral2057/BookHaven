

"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { getProducts, Product, getCategories, Category } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product/product-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Search, X, Filter, Barcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { BarcodeScanner } from "@/components/product/barcode-scanner";
import { Card } from "@/components/ui/card";
import Link from "next/link";

function ShopPageComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || null;

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [maxPrice, setMaxPrice] = useState(100);
  const [priceRange, setPriceRange] = useState([100]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length > 2) {
      const filteredSuggestions = products.filter(product =>
        (product.name && product.name.toLowerCase().includes(query.toLowerCase())) ||
        (product.author && product.author.toLowerCase().includes(query.toLowerCase())) ||
        (product.isbn && product.isbn.includes(query))
      ).slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };
  
  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }, [searchTerm, selectedCategory, router]);


  const handleScanSuccess = (result: string) => {
    setSearchTerm(result);
    setIsScannerOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setPriceRange([maxPrice]);
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((product) => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm.length === 0 ||
        (product.name && product.name.toLowerCase().includes(searchTermLower)) ||
        (product.author && product.author.toLowerCase().includes(searchTermLower)) ||
        (product.isbn && product.isbn.replace(/-/g, '').includes(searchTermLower.replace(/-/g, '')));
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
        {/* Price Filter */}
        <div>
          <Label htmlFor="price" className="text-lg font-semibold">
            Max Price
          </Label>
          <div className="flex justify-between items-center mt-2 font-medium">
            <span>रु0</span>
            <span>रु{priceRange[0]}</span>
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

        {(searchTerm.length > 0 || priceRange[0] < maxPrice) && (
          <Button variant="ghost" onClick={() => {
              setSearchTerm("");
              setPriceRange([maxPrice]);
          }} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
           <Breadcrumb />
          <div className="text-center mb-8 mt-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Our Collection
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Explore a world of stories, knowledge, and adventure.
            </p>
          </div>
          
           {/* Search Section */}
            <div className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                  <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                      <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                              id="search"
                              type="search" 
                              placeholder="Search by title, author, or ISBN..."
                              className="flex-grow text-base h-12 pl-10 pr-10"
                              value={searchTerm}
                              onChange={handleSearchChange}
                              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                          />
                          <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setIsScannerOpen(true)} type="button">
                            <Barcode className="h-5 w-5" />
                            <span className="sr-only">Scan Barcode</span>
                          </Button>
                      </div>
                  </form>
                  {suggestions.length > 0 && (
                      <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
                        <ul>
                          {suggestions.map(product => (
                            <li key={product.id}>
                              <Link href={`/products/${product.id}`} className="block p-3 hover:bg-accent">
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.author}</p>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar for Desktop */}
            <aside className="hidden lg:block lg:col-span-1 bg-card/50 p-6 rounded-lg self-start sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Filters</h2>
              <div className="relative">
                <FilterSidebarContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {/* Category Filters & Mobile Filter Trigger */}
               <div className="mb-6 flex items-center gap-4">
                 <div className="lg:hidden">
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
                        <div className="p-4 relative">
                            <FilterSidebarContent />
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-2 pb-2">
                        <Button
                          variant={!selectedCategory ? "secondary" : "outline"}
                          onClick={() => setSelectedCategory(null)}
                          className="rounded-full"
                        >
                          All Categories
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
                      </div>
                       <ScrollBar orientation="horizontal" className="h-2 [&>div]:hidden" />
                    </ScrollArea>
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
    <BarcodeScanner 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
    />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShopPageComponent />
    </Suspense>
  )
}

    