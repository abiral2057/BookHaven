
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Share2, Star } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ProductReviews } from "@/components/product/product-reviews";
import type { Product, Category, Review } from "@/lib/db";
import { Breadcrumb } from "@/components/layout/breadcrumb";

interface ProductDetailsClientProps {
  product: Product;
  category: Category | null;
  initialReviews: Review[];
  breadcrumbItems: { label: string; href?: string }[];
}

export function ProductDetailsClient({ product, category, initialReviews, breadcrumbItems }: ProductDetailsClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

  const isProductInWishlist = wishlist.some(item => item.id === product.id);
  
  const { reviewCount, averageRating } = useMemo(() => {
    const count = reviews.length;
    const avg = count > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / count : 0;
    return { reviewCount: count, averageRating: avg };
  }, [reviews]);

  const handleNewReview = (review: Review) => {
    setReviews(prevReviews => {
      // Create a new review object with a string date
      const newReviewWithStringDate = { ...review, createdAt: new Date().toISOString() };
      return [newReviewWithStringDate, ...prevReviews];
    });
  };
  

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = () => {
    if (isProductInWishlist) {
      removeFromWishlist(product.id);
      toast({ title: "Removed from Wishlist" });
    } else {
      addToWishlist(product);
      toast({ title: "Added to Wishlist" });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this book: ${product.name} by ${product.author}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied!",
          description: "Product link copied to your clipboard.",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: "Could not share the product at this time.",
      });
    }
  };

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="grid md:grid-cols-2 gap-8 md:gap-12 mt-8">
        {/* Product Image */}
        <div className="flex justify-center items-start">
           <div className="w-full max-w-sm">
              <Image
                  src={product.images?.[0] || 'https://picsum.photos/seed/3/300/450'}
                  alt={product.name}
                  width={300}
                  height={450}
                  className="rounded-lg shadow-2xl object-contain w-full aspect-[2/3]"
                  data-ai-hint="book cover"
              />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col pt-4">
          {category && (
              <div className="mb-2">
                  <Badge variant="secondary">{category.name}</Badge>
              </div>
          )}
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{product.name}</h1>
          <p className="mt-2 text-xl text-muted-foreground">{product.author}</p>
          
           <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                 {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("h-5 w-5", i < Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                  ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
           </div>

          <p className="mt-6 text-3xl font-bold text-primary">रु{product.price.toFixed(2)}</p>

          <div className="mt-6 text-base text-foreground/80 prose prose-invert max-w-none">
               <p className={cn(!isDescriptionExpanded && "line-clamp-3")}>
                  {product.description}
              </p>
              <Button 
                  variant="link" 
                  className="p-0"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                  {isDescriptionExpanded ? "Show Less" : "Show More"}
              </Button>
          </div>
          
          <div className="mt-auto pt-8">
               <p className="text-sm text-muted-foreground mb-2">
                  {product.stock > 0 ? `${product.stock} copies available` : 'Out of stock'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-500 hover:to-blue-500 text-primary-foreground shadow-lg shadow-blue-500/20" 
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                  >
                      <ShoppingCart className="mr-2 h-5 w-5"/>
                      {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </Button>
                  <div className="flex gap-2">
                   <Button variant="outline" size="lg" className="w-full" onClick={handleWishlistToggle}>
                      <Heart className={cn("mr-2 h-5 w-5", isProductInWishlist && "fill-destructive text-destructive")} />
                      Wishlist
                  </Button>
                   <Button variant="outline" size="lg" className="w-full" onClick={handleShare}>
                      <Share2 className="mr-2 h-5 w-5"/>
                      Share
                  </Button>
                  </div>
              </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <ProductReviews productId={product.id} initialReviews={reviews} onNewReview={handleNewReview} />
    </>
  );
}
