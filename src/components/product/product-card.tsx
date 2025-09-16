
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { type Product } from '@/lib/db';
import { ShoppingCart } from 'lucide-react';

export function ProductCard({ product }: { product: Product }) {
  const { toast } = useToast();
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Link href={`/products/${product.id}`} className="block h-full group">
      <Card className="bg-card/50 backdrop-blur-sm overflow-hidden border-border/20 shadow-sm hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
        <div className="relative bg-muted/20 aspect-[2/3] w-full">
          <Image
            src={product.images?.[0] || 'https://picsum.photos/seed/1/400/600'}
            alt={product.name}
            fill
            className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105 p-4"
            data-ai-hint="book cover"
          />
        </div>
        <CardContent className="p-3 md:p-4 flex flex-col flex-grow">
          <h3 className="text-sm md:text-base font-bold text-foreground truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{product.author}</p>
          <div className="flex flex-col md:flex-row md:items-center justify-between mt-auto pt-2">
            <p className="text-base md:text-lg font-semibold text-primary mb-2 md:mb-0">₹{product.price.toFixed(2)}</p>
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              size="sm"
              className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock > 0 ? "Add" : "Out of Stock"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
