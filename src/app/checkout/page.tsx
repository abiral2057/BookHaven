
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
} from "@/components/ui/card";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Book } from 'lucide-react';
import { addOrder } from "@/lib/db";
import { useEffect } from "react";

const shippingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

function OrderSummaryItem({ item }: { item: CartItem }) {
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
      <p className="font-medium">
        ₹{(item.price * item.quantity).toFixed(2)}
      </p>
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
  });
  
  useEffect(() => {
    if (user) {
      setValue('name', user.displayName || '');
      setValue('email', user.email || '');
    }
  }, [user, setValue]);

  const onSubmit: SubmitHandler<ShippingFormValues> = async (data) => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Your cart is empty",
        description: "You cannot place an order with an empty cart.",
      });
      return;
    }

    try {
      await addOrder({
        customer: {
          name: data.name,
          email: data.email,
        },
        items: cartItems,
        total: cartTotal,
        userId: user?.uid, // Associate order with logged-in user
      });

      toast({
        title: "Order Placed!",
        description: "Thank you for your purchase.",
      });

      clearCart();
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
        </div>
      </header>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-center text-4xl font-bold font-headline mb-12">
          Checkout
        </h1>
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Shipping Form */}
            <div>
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
            </div>

            {/* Order Summary */}
            <div>
                <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cartItems.map((item) => (
                    <OrderSummaryItem key={item.id} item={item} />
                    ))}
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xl font-bold border-t pt-6">
                    <p>Total</p>
                    <p>₹{cartTotal.toFixed(2)}</p>
                </CardFooter>
                </Card>
            </div>
            </div>
            <Button type="submit" form="checkout-form" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Placing Order..." : "Place Order"}
            </Button>
        </form>
      </div>
    </>
  );
}
