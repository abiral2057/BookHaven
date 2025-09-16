
"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, Product } from '@/lib/db';
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductCard } from "@/components/product/product-card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts(10); // Get 10 most recent products for the carousel
        setProducts(fetchedProducts);
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


  return (
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
        
        {/* Featured Books Section */}
        <section id="books" className="py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-foreground">Featured Books</h2>
                    <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Handpicked selections from our curators, just for you.</p>
                </div>
                {isLoading ? (
                  <div className="text-center text-muted-foreground">Loading books...</div>
                ) : products.length > 0 ? (
                  <Carousel
                    opts={{
                      align: "start",
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {products.map((product) => (
                        <CarouselItem key={product.id} className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
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
      </main>
      <Footer />
    </div>
  );
}
