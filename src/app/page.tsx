"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Book, ArrowRight, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, Product } from '@/lib/db';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();

  const handleAddToCart = () => {
    // TODO: Implement cart logic
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative">
        <Image
          src={product.images?.[0] || 'https://picsum.photos/seed/1/600/400'}
          alt={product.name}
          width={600}
          height={400}
          className="object-cover w-full h-64 transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="book cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-bold font-headline text-foreground truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.author}</p>
        <div className="flex items-center justify-between mt-4">
          <p className="text-xl font-semibold text-primary">${product.price.toFixed(2)}</p>
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
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
    <div className="bg-background min-h-screen">
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">BookHaven</span>
          </Link>
          <div className="flex items-center gap-4">
             <Button variant="ghost">
              <ShoppingCart className="mr-2"/>
              Cart (0)
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center text-white">
          <Image 
            src="https://images.unsplash.com/photo-1491841550275-5b462bf985ca?q=80&w=2070&auto=format&fit=crop"
            alt="Library with books"
            fill
            className="object-cover"
            priority
            data-ai-hint="library books"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 p-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight">
              Find Your Next Favorite Book
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/90">
              Explore our curated collection of classics, bestsellers, and hidden gems.
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                Explore Collection <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Featured Books Section */}
        <section id="books" className="py-16 sm:py-24 bg-secondary/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-headline text-foreground">Featured Books</h2>
                    <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Handpicked selections from our curators, just for you.</p>
                </div>
                {isLoading ? (
                  <div className="text-center text-muted-foreground">Loading books...</div>
                ) : products.length > 0 ? (
                  <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground italic col-span-full py-10">
                      No books have been added yet. Check back soon!
                  </div>
                )}
            </div>
        </section>

      </main>

      <footer className="border-t bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} BookHaven. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
