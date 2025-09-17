
"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, Product, getTopSellingProducts } from '@/lib/db';
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductCard } from "@/components/product/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";


export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [usedProducts, setUsedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [fetchedProducts, fetchedTopProducts, allFetchedProducts] = await Promise.all([
          getProducts(10), // Get 10 most recent products
          getTopSellingProducts(10), // Get 10 top selling products
          getProducts(), // Get all products for search
        ]);
        
        setFeaturedProducts(fetchedProducts);
        setTopProducts(fetchedTopProducts);
        setAllProducts(allFetchedProducts);

        const used = allFetchedProducts.filter(p => p.condition === 'Used').slice(0, 10);
        setUsedProducts(used);

      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch products from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);
  
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 1) {
      const filteredSuggestions = allProducts.filter(product =>
        (product.name && product.name.toLowerCase().includes(query.toLowerCase())) ||
        (product.author && product.author.toLowerCase().includes(query.toLowerCase())) ||
        (product.isbn && product.isbn.includes(query))
      ).slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };


  return (
    <>
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white">
          <Image 
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=2070&auto=format&fit=crop"
            alt="Library with books"
            fill
            className="object-cover"
            priority
            data-ai-hint="library books"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="relative z-10 p-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-300">
              Find Your Next Favorite Book
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/80">
              Explore our curated collection of classics, bestsellers, and hidden gems.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-500 hover:to-blue-500 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg shadow-blue-500/20">
                <Link href="/shop">
                  Explore Collection <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Search Section */}
        <section className="py-16 bg-card/50">
            <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-foreground">Search Our Shelves</h2>
                <p className="mt-2 text-center text-muted-foreground">Looking for something specific? Start your search here.</p>
                <div className="relative">
                  <form onSubmit={handleSearchSubmit} className="mt-8 flex gap-2">
                      <div className="relative flex-grow">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input 
                              type="search" 
                              placeholder="Search by title, author, or ISBN..."
                              className="flex-grow text-base h-12 pl-10"
                              value={searchQuery}
                              onChange={handleSearchChange}
                              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                          />
                      </div>
                      <Button type="submit" size="lg" className="h-12">
                          <Search className="mr-2 h-5 w-5 md:hidden" />
                          <span className="hidden md:inline">Search</span>
                      </Button>
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
        </section>

        {/* Featured Books Section */}
        <section id="books" className="py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-foreground">Featured Books</h2>
                    <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Handpicked selections from our curators, just for you.</p>
                </div>
                {isLoading ? (
                  <div className="text-center text-muted-foreground">Loading books...</div>
                ) : featuredProducts.length > 0 ? (
                  <Carousel
                    opts={{
                      align: "start",
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {featuredProducts.map((product) => (
                        <CarouselItem key={product.id} className="basis-2/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                          <div className="p-1 h-full">
                             <ProductCard product={product} />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                  </Carousel>
                ) : (
                  <div className="text-center text-muted-foreground italic col-span-full py-10">
                      No books have been added yet. Check back soon!
                  </div>
                )}
            </div>
        </section>
        
        {/* Top Selling Books Section */}
        {topProducts.length > 0 && (
          <section id="top-sellers" className="py-16 sm:py-24 bg-card/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                      <h2 className="text-4xl font-bold text-foreground">Top Sellers</h2>
                      <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">See what other readers are loving right now.</p>
                  </div>
                  {isLoading ? (
                    <div className="text-center text-muted-foreground">Loading top sellers...</div>
                  ) : (
                    <Carousel
                      opts={{
                        align: "start",
                      }}
                      className="w-full"
                    >
                      <CarouselContent>
                        {topProducts.map((product) => (
                          <CarouselItem key={product.id} className="basis-2/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                            <div className="p-1 h-full">
                               <ProductCard product={product} />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden sm:flex" />
                      <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                  )}
              </div>
          </section>
        )}

        {/* Used Books Section */}
        {usedProducts.length > 0 && (
          <section id="used-books" className="py-16 sm:py-24">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                      <h2 className="text-4xl font-bold text-foreground">Gently Used Books</h2>
                      <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Great stories at even better prices. Discover our second-hand collection.</p>
                  </div>
                  {isLoading ? (
                    <div className="text-center text-muted-foreground">Loading used books...</div>
                  ) : (
                    <Carousel
                      opts={{
                        align: "start",
                      }}
                      className="w-full"
                    >
                      <CarouselContent>
                        {usedProducts.map((product) => (
                          <CarouselItem key={product.id} className="basis-2/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                            <div className="p-1 h-full">
                               <ProductCard product={product} />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden sm:flex" />
                      <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                  )}
              </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
    </>
  );
}
