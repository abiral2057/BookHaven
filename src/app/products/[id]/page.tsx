

"use client";

import { useState, useEffect } from "react";
import { getProduct, getProducts, Product, getReviewsByProductId, Review } from "@/lib/db";
import { getCategories, Category } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, ShoppingCart, ArrowLeft, Heart, Share2, Star } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductReviews } from "@/components/product/product-reviews";

function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="bg-card/50 overflow-hidden border-border/20 shadow-sm hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 group h-full flex flex-col">
        <div className="relative aspect-[2/3] bg-muted/20">
          <Image
            src={product.images?.[0] || 'https://picsum.photos/seed/2/400/600'}
            alt={product.name}
            fill
            className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105 p-2"
            data-ai-hint="book cover"
          />
        </div>
        <CardContent className="p-3 flex flex-col flex-grow">
          <h3 className="text-sm font-bold text-foreground truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 truncate">{product.author}</p>
          <p className="text-base font-semibold text-primary mt-auto pt-2">रु{product.price.toFixed(2)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}


export default function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);


  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

  const isProductInWishlist = product ? wishlist.some(item => item.id === product.id) : false;
  
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount : 0;


  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProduct, fetchedCategories, allProds, fetchedReviews] = await Promise.all([
            getProduct(id),
            getCategories(),
            getProducts(),
            getReviewsByProductId(id),
        ]);

        if (!fetchedProduct) {
          notFound();
        }
        
        setProduct(fetchedProduct);
        setReviews(fetchedReviews);
        
        const productCategory = fetchedCategories.find(c => c.id === fetchedProduct.category);
        setCategory(productCategory || null);

        if (allProds.length > 1) {
            const categoryProducts = allProds.filter(p => p.category === fetchedProduct.category && p.id !== fetchedProduct.id).slice(0, 5);
            setRecommendations(categoryProducts);
        }

      } catch (error) {
        console.error("Error fetching product data:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load product details.'
        })
      } finally {
        setIsLoading(true);
      }
    };

    fetchProductData();
  }, [id, toast]);

  const handleNewReview = (review: Review) => {
    setReviews(prevReviews => [review, ...prevReviews]);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return null; 
  }
  
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
  ];

  if (category) {
    breadcrumbItems.push({ label: category.name, href: `/shop?category=${category.id}` });
  }

  breadcrumbItems.push({ label: product.name });


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
        // Fallback for browsers that don't support the Web Share API
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
     <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border/60 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">BookHaven</span>
          </Link>
           <Button variant="outline" asChild className="border-primary/20 hover:bg-primary/5">
                <Link href="/shop">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Store
                </Link>
            </Button>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
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
        <ProductReviews productId={id} initialReviews={reviews} onNewReview={handleNewReview} />


        {/* Related Products */}
        {recommendations.length > 0 && (
            <section className="mt-24">
                <h2 className="text-3xl font-bold text-center mb-10">You Might Also Like</h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {recommendations.map(rec => (
                        <RelatedProductCard key={rec.id} product={rec} />
                    ))}
                </div>
            </section>
        )}
      </main>
    </>
  );
}
