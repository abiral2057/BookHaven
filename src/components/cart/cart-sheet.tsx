

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/hooks/use-cart";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';

function CartItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-start gap-4 py-4">
      <Image
        src={item.images?.[0] || "https://picsum.photos/seed/1/100/150"}
        alt={item.name}
        width={80}
        height={120}
        className="rounded-md object-cover"
        data-ai-hint="book cover"
      />
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{item.name}</h4>
        <p className="text-xs text-muted-foreground">{item.author}</p>
        <p className="text-sm font-medium mt-1">रु{item.price.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
         <p className="text-xs text-muted-foreground mt-1">Stock: {item.stock}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={() => removeFromCart(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function CartSheet() {
  const { cartItems, cartCount, cartTotal } = useCart();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative">
          <ShoppingCart />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {cartCount}
            </span>
          )}
           <span className="sr-only">Open Cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        {cartCount > 0 ? (
          <>
            <ScrollArea className="flex-1 -mx-6">
              <div className="px-6 divide-y divide-border">
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="mt-auto pt-6 border-t">
              <div className="w-full space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>रु{cartTotal.toFixed(2)}</span>
                </div>
                <SheetClose asChild>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Your cart is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add some books to get started.
            </p>
             <SheetClose asChild>
                <Button asChild className="mt-6">
                    <Link href="/shop">Continue Shopping</Link>
                </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
