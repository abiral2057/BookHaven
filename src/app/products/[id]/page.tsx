"use client";

import { useState, useEffect } from "react";
import { getProduct, getProducts, Product } from "@/lib/db";
import { getCategories, Category } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, Home, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

function RelatedProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="block h-full">
      <Card className="bg-card/50 backdrop-blur-sm overflow-hidden border-border/20 shadow-lg hover:shadow-primary/10 hover:border-primary/20 transition-all duration-300 group h-full flex flex-col">
        <div className="relative">
          <Image
            src={product.images?.[0] || 'https://picsum.photos/seed/2/600/400'}
            alt={product.name}
            width={600}
            height={400}
            className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="book cover"
          />
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="text-base font-bold text-foreground truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{product.author}</p>
          <p className="text-lg font-semibold text-primary mt-auto pt-2">₹{product.price.toFixed(2)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}


export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const [fetchedProduct, fetchedCategories, allProds] = await Promise.all([
            getProduct(params.id),
            getCategories(),
            getProducts()
        ]);

        if (!fetchedProduct) {
          notFound();
        }
        
        setProduct(fetchedProduct);
        
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
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [params.id, toast]);

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

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <>
     <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">BookHaven</span>
          </Link>
           <Button variant="outline" asChild className="border-primary/20 hover:bg-primary/5">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back to Store
                </Link>
            </Button>
        </div>
      </header>
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Image */}
          <div className="flex justify-center items-start">
             <Image
                src={product.images?.[0] || 'https://picsum.photos/seed/3/600/800'}
                alt={product.name}
                width={600}
                height={800}
                className="rounded-lg shadow-2xl object-cover w-full max-w-md aspect-[2/3]"
                data-ai-hint="book cover"
                priority
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col pt-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">{product.name}</h1>
            <p className="mt-2 text-xl text-muted-foreground">{product.author}</p>
            
             {category && (
                <div className="mt-4">
                    <Badge variant="secondary">{category.name}</Badge>
                </div>
            )}
            
            <p className="mt-6 text-3xl font-bold text-primary">₹{product.price.toFixed(2)}</p>

            <div className="mt-6 text-lg text-foreground/80 prose prose-invert max-w-none">
                <p>{product.description}</p>
            </div>
            
            <div className="mt-8">
                 <p className="text-sm text-muted-foreground">
                    {product.stock > 0 ? `${product.stock} copies available` : 'Out of stock'}
                </p>
                <Button 
                    size="lg" 
                    className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-500 hover:to-blue-500 text-primary-foreground shadow-lg shadow-blue-500/20" 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                >
                    <ShoppingCart className="mr-2 h-5 w-5"/>
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </Button>
            </div>
          </div>
        </div>
        
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
