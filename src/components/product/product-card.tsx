
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
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="bg-card/50 backdrop-blur-sm overflow-hidden border-border/20 shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 group h-full flex flex-col">
        <div className="relative">
          <Image
            src={product.images?.[0] || 'https://picsum.photos/seed/1/600/400'}
            alt={product.name}
            width={600}
            height={400}
            className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="book cover"
          />
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-foreground truncate">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{product.author}</p>
          <div className="flex items-center justify-between mt-auto pt-4">
            <p className="text-xl font-semibold text-primary">₹{product.price.toFixed(2)}</p>
            <Button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              size="sm"
              className="bg-primary/90 hover:bg-primary text-primary-foreground"
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
