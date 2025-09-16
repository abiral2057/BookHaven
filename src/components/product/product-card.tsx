

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { type Product } from '@/lib/db';
import { ShoppingCart, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const isProductInWishlist = wishlist.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProductInWishlist) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from Wishlist" });
    } else {
      addToWishlist(product);
      toast({ title: "Added to Wishlist" });
    }
  };

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <Card className="bg-card/50 backdrop-blur-sm overflow-hidden border-border/20 shadow-sm hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 h-full flex flex-col relative">
        <Button 
          onClick={handleWishlistToggle} 
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-background/50 hover:bg-background"
        >
          <Heart className={cn("h-4 w-4 text-foreground/70", isProductInWishlist && "fill-destructive text-destructive")} />
          <span className="sr-only">Toggle Wishlist</span>
        </Button>
        <div className="relative bg-muted/20 aspect-[2/3] w-full">
          <Image
            src={product.images?.[0] || 'https://picsum.photos/seed/1/400/600'}
            alt={product.name}
            fill
            className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105 p-2"
            data-ai-hint="book cover"
          />
        </div>
        <CardContent className="p-3 flex flex-col flex-grow">
          <h3 className="text-sm font-bold text-foreground truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">{product.author}</p>
          <div className="flex items-center justify-between mt-auto pt-2">
            <p className="text-base font-semibold text-primary">रु{product.price.toFixed(2)}</p>
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              size="icon"
              className="bg-primary/90 hover:bg-primary text-primary-foreground h-8 w-8 shrink-0"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to Cart</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
