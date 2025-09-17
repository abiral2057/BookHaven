
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
        const verifyPayment = async () => {
            const data = searchParams.get('data');
            if (!data) {
                setError("No payment data received from eSewa.");
                setStatus('failed');
                return;
            }

            try {
                const decodedData = JSON.parse(atob(data));
                const { transaction_uuid, total_amount, status: paymentStatus } = decodedData;
                
                if (paymentStatus !== 'COMPLETE') {
                    setError(`Payment not completed. Status: ${paymentStatus}`);
                    setStatus('failed');
                    return;
                }
                
                // 1. Check if an order with this transaction_uuid already exists
                const existingOrder = await getOrderByTransactionId(transaction_uuid);
                if (existingOrder) {
                    setStatus('duplicate');
                    // Clear cart and redirect, as the order is already processed.
                    setLastOrderItemsAndClearCart(existingOrder.items);
                    router.replace('/order-confirmation');
                    return;
                }

                // 2. Retrieve order details from localStorage
                const storedOrderDetails = localStorage.getItem('esewa_order_details');
                const storedTransactionId = localStorage.getItem('esewa_transaction_uuid');

                if (!storedOrderDetails || transaction_uuid !== storedTransactionId) {
                    setError("Could not verify transaction. Local data mismatch or missing.");
                    setStatus('failed');
                    return;
                }

                const orderPayload = JSON.parse(storedOrderDetails);

                // 3. Verify amount
                if (parseFloat(total_amount).toFixed(2) !== parseFloat(orderPayload.total).toFixed(2)) {
                    setError(`Amount mismatch. Paid: ${total_amount}, Expected: ${orderPayload.total}`);
                    setStatus('failed');
                    return;
                }

                // 4. If all checks pass, create the order in the database
                await addOrder({
                    ...orderPayload,
                    paymentMethod: 'eSewa',
                    transactionId: transaction_uuid,
                });
                
                // 5. Clean up localStorage and update cart state
                localStorage.removeItem('esewa_order_details');
                localStorage.removeItem('esewa_transaction_uuid');
                setLastOrderItemsAndClearCart(orderPayload.items);

                setStatus('verified');

                // Redirect to the main confirmation page
                router.replace('/order-confirmation');

            } catch (e: any) {
                console.error("eSewa success verification failed:", e);
                setError(e.message || "An unknown error occurred during verification.");
                setStatus('failed');
            }
        };

        verifyPayment();
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
                     {status === 'verified' && (
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
                        {status === 'verified' && 'Payment Successful!'}
                        {status === 'failed' && 'Payment Verification Failed'}
                        {status === 'duplicate' && 'Processing Order...'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {status === 'verifying' && (
                         <p className="text-muted-foreground">
                            Please wait while we confirm your eSewa payment. Do not close this page.
                        </p>
                    )}
                     {status === 'verified' && (
                         <>
                            <p className="text-muted-foreground">
                                Your payment has been successfully verified. Redirecting you now...
                            </p>
                            <Button asChild className="mt-8" size="lg">
                                <Link href="/order-confirmation">Continue</Link>
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
                     {status === 'duplicate' && (
                         <p className="text-muted-foreground">
                            This order is already being processed. Redirecting...
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}


export default function EsewaSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  )
}

    