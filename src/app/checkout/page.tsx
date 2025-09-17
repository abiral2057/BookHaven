
"use client";

import { useCart, type CartItem } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Book, ArrowLeft, Trash2 } from 'lucide-react';
import { addOrder } from "@/lib/db";
import { useEffect, useState, useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { generateEsewaSignature } from "@/ai/flows/esewa";

const shippingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  paymentMethod: z.enum(["cod", "esewa", "khalti"]),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

function OrderSummaryItem({ item, onRemove }: { item: CartItem, onRemove: (id: string) => void }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <Image
        src={item.images?.[0] || "https://picsum.photos/seed/1/100/150"}
        alt={item.name}
        width={60}
        height={90}
        className="rounded-md object-cover"
      />
      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          Qty: {item.quantity}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <p className="font-medium">
            रु{(item.price * item.quantity).toFixed(2)}
        </p>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => onRemove(item.id)}>
            <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, setLastOrderItemsAndClearCart, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const transactionUUID = useId();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      paymentMethod: "cod",
    }
  });

  const paymentMethod = watch("paymentMethod");
  
  useEffect(() => {
    if (user) {
      setValue('name', user.displayName || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  const storeOrderInLocalStorage = () => {
     const orderDetails = {
        customer: { name: watch('name'), email: watch('email') },
        shippingAddress: { address: watch('address'), city: watch('city'), postalCode: watch('postalCode') },
        items: cartItems,
        total: cartTotal,
      };
      localStorage.setItem('pending_order_details', JSON.stringify(orderDetails));
  }
  
  const handleKhaltiPayment = async () => {
    const totalAmount = cartTotal * 100; // Khalti expects amount in paisa
    const purchaseOrderId = `${transactionUUID}-${Date.now()}`;

    storeOrderInLocalStorage();
    localStorage.setItem('khalti_purchase_order_id', purchaseOrderId);
    
    const khaltiUrl = new URL("https://khalti.com/api/v2/epayment/initiate/");

    const payload = {
        return_url: `${window.location.origin}/khalti/success/`,
        website_url: `${window.location.origin}`,
        amount: totalAmount,
        purchase_order_id: purchaseOrderId,
        purchase_order_name: `BookHaven Order ${purchaseOrderId}`,
        customer_info: {
            name: watch('name'),
            email: watch('email'),
        },
    };
    
    try {
        const response = await fetch('/api/khalti/initiate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        
        if (result.payment_url) {
            router.push(result.payment_url);
        } else {
             toast({
                variant: "destructive",
                title: "Khalti Payment Error",
                description: result.error || "Could not initiate Khalti payment.",
            });
        }
    } catch(error) {
        console.error("Khalti initiation failed:", error);
        toast({
            variant: "destructive",
            title: "Khalti Payment Error",
            description: "Could not connect to the payment gateway.",
        });
    }
  };
  
  const handleEsewaPayment = async () => {
    const totalAmount = cartTotal.toFixed(2);
    const uniqueTransactionId = `${transactionUUID}-${Date.now()}`;
  
    try {
      // 1. Get signature from server
      const signatureResponse = await generateEsewaSignature({
        amount: totalAmount,
        transaction_uuid: uniqueTransactionId
      });
      const { signature } = signatureResponse;
  
      // 2. Create a hidden form and submit it
      const esewaForm = document.createElement('form');
      esewaForm.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      esewaForm.method = "POST";
      esewaForm.style.display = "none";
  
      const params: Record<string, string> = {
        'amount': totalAmount,
        'failure_url': `${window.location.origin}/esewa/failure`,
        'product_delivery_charge': '0',
        'product_service_charge': '0',
        'product_code': 'EPAYTEST',
        'signature': signature,
        'signed_field_names': 'total_amount,transaction_uuid,product_code',
        'success_url': `${window.location.origin}/esewa/success`,
        'tax_amount': '0',
        'total_amount': totalAmount,
        'transaction_uuid': uniqueTransactionId,
      };
      
      storeOrderInLocalStorage();
      localStorage.setItem('esewa_transaction_uuid', uniqueTransactionId);

      for (const key in params) {
        const input = document.createElement('input');
        input.name = key;
        input.value = params[key];
        esewaForm.appendChild(input);
      }
  
      document.body.appendChild(esewaForm);
      esewaForm.submit();
  
    } catch (error) {
      console.error("eSewa payment initiation failed:", error);
      toast({
        variant: "destructive",
        title: "eSewa Payment Error",
        description: "Could not initiate the payment. Please try again.",
      });
    }
  };

  const handleCodPayment = async (data: ShippingFormValues) => {
     if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You must be logged in to place an order.",
      });
      return;
    }

    try {
      await addOrder({
        customer: {
          name: data.name,
          email: data.email,
        },
        shippingAddress: {
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
        },
        items: cartItems,
        total: cartTotal,
        paymentMethod: 'COD',
      });

      toast({
        title: "Order Placed!",
        description: "Thank you for your purchase. You will pay on delivery.",
      });

      setLastOrderItemsAndClearCart(cartItems);
      router.push("/order-confirmation");

    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        variant: "destructive",
        title: "Order Failed",
        description: "There was a problem placing your order. Please try again.",
      });
    }
  };

  const onSubmit: SubmitHandler<ShippingFormValues> = async (data) => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Your cart is empty",
        description: "You cannot place an order with an empty cart.",
      });
      return;
    }

    if (data.paymentMethod === "esewa") {
      handleEsewaPayment();
    } else if (data.paymentMethod === "khalti") {
      handleKhaltiPayment();
    } else {
      handleCodPayment(data);
    }
  };

  if (cartItems.length === 0 && typeof window !== 'undefined') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">You can't checkout without any books in your cart.</p>
            <Button asChild>
                <Link href="/">Return to Store</Link>
            </Button>
        </div>
    )
  }

  return (
    <>
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">BookHaven</span>
          </Link>
           <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Store
              </Link>
            </Button>
        </div>
      </header>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-center text-4xl font-bold font-headline mb-12">
          Checkout
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            <div className="flex flex-col gap-8">
               {/* Shipping Form */}
                <Card>
                <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...register("name")} />
                        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email")} />
                        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...register("address")} />
                        {errors.address && <p className="text-destructive text-sm">{errors.address.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" {...register("city")} />
                        {errors.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input id="postalCode" {...register("postalCode")} />
                        {errors.postalCode && <p className="text-destructive text-sm">{errors.postalCode.message}</p>}
                        </div>
                    </div>
                </CardContent>
                </Card>

                 {/* Payment Method */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>Choose how you'd like to pay.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            defaultValue="cod"
                            onValueChange={(val) => setValue('paymentMethod', val as 'cod' | 'esewa' | 'khalti')}
                            className="space-y-2"
                            >
                            <Label className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer">
                                <RadioGroupItem value="cod" id="cod" />
                                <span className="flex-1">Cash on Delivery</span>
                            </Label>
                            <Label className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer">
                                <RadioGroupItem value="esewa" id="esewa" />
                                <span className="flex-1">Pay with eSewa</span>
                                 <Image src="https://blog.esewa.com.np/wp-content/uploads/2022/11/esewa-icon.png" width={40} height={40} alt="eSewa" />
                            </Label>
                             <Label className="flex items-center space-x-2 rounded-md border p-4 cursor-pointer">
                                <RadioGroupItem value="khalti" id="khalti" />
                                <span className="flex-1">Pay with Khalti</span>
                                 <Image src="https://khalti.com/static/img/logo-khalti.svg" width={60} height={40} alt="Khalti" />
                            </Label>
                        </RadioGroup>
                         {errors.paymentMethod && <p className="text-destructive text-sm mt-2">{errors.paymentMethod.message}</p>}
                    </CardContent>
                </Card>
            </div>


            {/* Order Summary */}
            <div>
                <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 divide-y">
                    {cartItems.map((item) => (
                    <OrderSummaryItem key={item.id} item={item} onRemove={removeFromCart} />
                    ))}
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xl font-bold border-t pt-6">
                    <p>Total</p>
                    <p>रु{cartTotal.toFixed(2)}</p>
                </CardFooter>
                </Card>
            </div>
            </div>
            <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : 
                  (paymentMethod === 'esewa' ? 'Pay with eSewa' : 
                  (paymentMethod === 'khalti' ? 'Pay with Khalti' : 'Place Order'))
                }
            </Button>
        </form>
      </div>
    </>
  );
}
