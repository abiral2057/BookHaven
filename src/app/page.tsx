"use client";

import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Book, ArrowRight, ShoppingCart, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, Product } from '@/lib/db';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group h-full flex flex-col">
      <div className="relative">
        <Image
          src={product.images?.[0] || 'https://picsum.photos/seed/1/600/400'}
          alt={product.name}
          width={600}
          height={400}
          className="object-cover w-full h-56 transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="book cover"
        />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold font-headline text-foreground truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.author}</p>
        <div className="flex items-center justify-between mt-auto pt-4">
          <p className="text-xl font-semibold text-primary">₹{product.price.toFixed(2)}</p>
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            size="sm"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UserButton() {
    const { user, signInWithGoogle, logout, isAdmin, loading } = useAuth();

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "??";
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    if (loading) {
      return <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />;
    }

    if (!user) {
        return (
          <>
            <Button onClick={signInWithGoogle} variant="outline">Login</Button>
            <Button asChild variant="ghost">
                <Link href="/admin/login"><ShieldCheck className="mr-2 h-4 w-4" />Admin Login</Link>
            </Button>
          </>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt={user.displayName || "User"} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={"/dashboard"}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
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
            <CartSheet />
            <UserButton />
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
              <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
                <Link href="#books">
                  Explore Collection <ArrowRight className="ml-2" />
                </Link>
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
                  <Carousel
                    opts={{
                      align: "start",
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {products.map((product) => (
                        <CarouselItem key={product.id} className="sm:basis-1/2 md:basis-1/3">
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

      <footer className="border-t bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} BookHaven. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
