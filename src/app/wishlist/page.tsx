
"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Your Wishlist
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Books you've saved for later.
            </p>
          </div>
          
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <div className="text-center py-24 col-span-full bg-card/50 rounded-lg">
                <Heart className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">
                    Your Wishlist is Empty
                </h3>
                <p className="mt-2 text-muted-foreground">
                    Add some books to your wishlist to see them here.
                </p>
                <Button
                    variant="default"
                    className="mt-6"
                    asChild
                >
                    <Link href="/shop">Explore Books</Link>
                </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
