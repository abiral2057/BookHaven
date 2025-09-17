
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function KhaltiFailurePage() {

    useEffect(() => {
        // Clean up local storage on failure
        localStorage.removeItem('pending_order_details');
        localStorage.removeItem('khalti_purchase_order_id');
    }, []);

    return (
        <div className="min-h-screen bg-background p-4 flex justify-center items-center">
            <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                        <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="mt-6 text-3xl font-bold font-headline">
                        Payment Failed or Canceled
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Unfortunately, your payment could not be processed or was canceled. Please try again.
                    </p>
                    <Button asChild className="mt-8" size="lg" variant="outline">
                        <Link href="/checkout">Return to Checkout</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
