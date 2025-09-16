
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Heart, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: BookOpen },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/checkout", label: "Cart", icon: ShoppingCart },
];

export function BottomNavbar() {
  const pathname = usePathname();
  const { wishlist, isMounted: isWishlistMounted } = useWishlist();
  const { cartCount, isMounted: isCartMounted } = useCart();

  const getCountForPath = (path: string) => {
    if (path === '/wishlist') return isWishlistMounted ? wishlist.length : 0;
    if (path === '/checkout') return isCartMounted ? cartCount : 0;
    return 0;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border/60 z-50 flex md:hidden">
      {navItems.map((item) => {
        const isActive = (item.href === "/" && pathname === "/") || (item.href !== "/" && pathname.startsWith(item.href));
        const count = getCountForPath(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center text-xs gap-1 relative",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {count > 0 && (
                 <span className="absolute top-1 right-[25%] flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {count}
                </span>
            )}
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
