

import { getProduct, getProducts, getReviewsByProductId } from "@/lib/db";
import { getCategories } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ProductDetailsClient } from "./product-details-client";
import { Header } from "@/components/layout/header";

function RelatedProductCard({ product }: { product: Awaited<ReturnType<typeof getProduct>> }) {
  if (!product) return null;
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
      <Header />
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <ProductDetailsClient 
            product={product} 
            category={category} 
            initialReviews={reviews} 
            breadcrumbItems={breadcrumbItems}
        />

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
