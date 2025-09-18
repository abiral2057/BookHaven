
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useCart } from '@/hooks/use-cart';
import { addOrder, getOrderByTransactionId } from '@/lib/db';

function SuccessPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { setLastOrderItemsAndClearCart } = useCart();
    const [status, setStatus] = useState<'verifying' | 'verified' | 'failed' | 'duplicate'>('verifying');
    const [error, setError] = useState('');

    useEffect(() => {
        const processPayment = async () => {
            const pidx = searchParams.get('pidx');
            const purchase_order_id = searchParams.get('purchase_order_id');

            if (!pidx || !purchase_order_id) {
                setError("Invalid callback from Khalti. Missing parameters.");
                setStatus('failed');
                return;
            }

            try {
                const existingOrder = await getOrderByTransactionId(pidx);
                if (existingOrder) {
                    setStatus('duplicate');
                    localStorage.removeItem('pending_order_details');
                    localStorage.removeItem('khalti_purchase_order_id');
                    setLastOrderItemsAndClearCart(existingOrder.items);
                    router.replace('/dashboard');
                    return;
                }

                // Call the new verification API route
                const verificationResponse = await fetch('/api/khalti/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pidx }),
                });

                const verificationResult = await verificationResponse.json();

                if (!verificationResponse.ok || !verificationResult.success || verificationResult.status !== 'Completed') {
                    setError(verificationResult.error || `Payment status is ${verificationResult.status}.`);
                    setStatus('failed');
                    localStorage.removeItem('pending_order_details');
                    localStorage.removeItem('khalti_purchase_order_id');
                    return;
                }

                const storedOrderDetails = localStorage.getItem('pending_order_details');
                const storedPurchaseOrderId = localStorage.getItem('khalti_purchase_order_id');

                if (!storedOrderDetails || purchase_order_id !== storedPurchaseOrderId) {
                    setError("Could not verify transaction. Local data mismatch or missing.");
                    setStatus('failed');
                    return;
                }

                const orderPayload = JSON.parse(storedOrderDetails);
                const khaltiData = verificationResult.data;

                if (khaltiData.total_amount / 100 !== orderPayload.total) {
                     setError(`Amount mismatch. Paid: ${khaltiData.total_amount / 100}, Expected: ${orderPayload.total}`);
                     setStatus('failed');
                     return;
                }
                
                setStatus('verified');

                 await addOrder({
                    ...orderPayload,
                    paymentMethod: 'Khalti',
                    transactionId: pidx,
                });
                
                localStorage.removeItem('pending_order_details');
                localStorage.removeItem('khalti_purchase_order_id');
                setLastOrderItemsAndClearCart(orderPayload.items);

                router.replace('/dashboard');

            } catch (e: any) {
                console.error("Khalti success verification failed:", e);
                setError(e.message || "An unknown error occurred during verification.");
                setStatus('failed');
            }
        };

        processPayment();
    }, [searchParams, router, setLastOrderItemsAndClearCart]);

    return (
        <div className="min-h-screen bg-background p-4 flex justify-center items-center">
            <Card className="w-full max-w-lg text-center shadow-lg">
                <CardHeader>
                    {status === 'verifying' && (
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
                        </div>
                    )}
                     {(status === 'verified' || status === 'duplicate') && (
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                        </div>
                    )}
                     {status === 'failed' && (
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
                            <XCircle className="h-12 w-12 text-destructive" />
                        </div>
                    )}
                    <CardTitle className="mt-6 text-3xl font-bold font-headline">
                        {status === 'verifying' && 'Verifying Payment...'}
                        {status === 'verified' && 'Processing Your Order...'}
                        {status === 'failed' && 'Payment Verification Failed'}
                        {status === 'duplicate' && 'Order Already Processed'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {status === 'verifying' && (
                         <p className="text-muted-foreground">
                            Please wait while we confirm your Khalti payment. Do not close this page.
                        </p>
                    )}
                     {(status === 'verified' || status === 'duplicate') && (
                         <>
                            <p className="text-muted-foreground">
                                Your payment was successful! We are now processing your order and redirecting you to your dashboard.
                            </p>
                            <Button asChild className="mt-8" size="lg">
                                <Link href="/dashboard">Go to My Orders</Link>
                            </Button>
                         </>
                    )}
                     {status === 'failed' && (
                         <>
                            <p className="text-destructive">
                                There was an issue verifying your payment: {error}
                            </p>
                            <Button asChild className="mt-8" size="lg" variant="outline">
                                <Link href="/checkout">Return to Checkout</Link>
                            </Button>
                         </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


export default function KhaltiSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  )
}
