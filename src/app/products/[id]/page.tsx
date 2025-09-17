

import { getProduct, getProducts, Product, getReviewsByProductId, Review } from "@/lib/db";
import { getCategories, Category } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Book, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductDetailsClient } from "./product-details-client";

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


export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [product, categories, allProducts, reviews] = await Promise.all([
    getProduct(id),
    getCategories(),
    getProducts(),
    getReviewsByProductId(id),
  ]);

  if (!product) {
    notFound();
  }

  const category = categories.find(c => c.id === product.category) || null;

  const recommendations = allProducts.length > 1
    ? allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 5)
    : [];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
  ];
  if (category) {
    breadcrumbItems.push({ label: category.name, href: `/shop?category=${category.id}` });
  }
  breadcrumbItems.push({ label: product.name });

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
        <ProductDetailsClient product={product} category={category} initialReviews={reviews} />

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
