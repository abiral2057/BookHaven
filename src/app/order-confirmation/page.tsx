
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import Image from 'next/image';

export default function OrderConfirmationPage() {
    const { lastOrderItems, isMounted } = useCart();
    
    return (
        <div className="min-h-screen bg-background p-4 flex justify-center items-center">
            <div className="w-full max-w-lg">
                <Card className="text-center shadow-lg">
                    <CardHeader>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                        </div>
                        <CardTitle className="mt-6 text-3xl font-bold font-headline">
                            Thank You for Your Order!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Your order has been placed successfully. A confirmation email has been sent to you.
                        </p>
                        <Button asChild className="mt-8" size="lg">
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                    </CardContent>
                </Card>
                
                {isMounted && lastOrderItems.length > 0 && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Review Your Products</CardTitle>
                            <CardDescription>Let others know what you think of your new books!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {lastOrderItems.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-2 rounded-md border">
                                    <Image
                                        src={item.images?.[0] || 'https://picsum.photos/seed/1/100/150'}
                                        alt={item.name}
                                        width={50}
                                        height={75}
                                        className="rounded object-cover"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">{item.author}</p>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/products/${item.id}#reviews`}>Write a review</Link>
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
