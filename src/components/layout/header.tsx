

"use client";

import Link from 'next/link';
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useWishlist } from "@/hooks/use-wishlist";
import { Button } from '@/components/ui/button';
import { CartSheet } from "@/components/cart/cart-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, LogOut, ShieldCheck, User, Menu, X, LogIn, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { BottomNavbar } from './bottom-navbar';

function UserButton() {
    const { user, signInWithGoogle, logout, loading, isAdmin } = useAuth();

    const getInitials = (name: string | null | undefined) => {
        if (!name) return "??";
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    if (loading) {
      return <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />;
    }

    if (!user) {
        return (
          <>
            <Button asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
            </Button>
          </>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt={user.displayName || "User"} />
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                    </Link>
                </DropdownMenuItem>
                 {isAdmin && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard">
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                        </Link>
                    </DropdownMenuItem>
                 )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                     <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  const navItems = [
    { href: '/', label: 'Home'},
    { href: '/shop', label: 'Shop'},
    { href: '/about', label: 'About'},
  ]

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
      <>
        <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-border/60 sticky top-0 bg-background/80 backdrop-blur-sm z-40">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link href="/" className="flex items-center gap-2">
              <Book className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">BookHaven</span>
            </Link>
            <nav className="hidden md:flex gap-6 items-center">
              {navItems.map((item) => (
                  <Link 
                      key={item.label}
                      href={item.href} 
                      className={cn(
                          "text-sm font-medium transition-colors",
                          pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                  >
                      {item.label}
                  </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild className="relative">
                    <Link href="/wishlist">
                        <Heart />
                        {wishlistCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {wishlistCount}
                          </span>
                        )}
                        <span className="sr-only">Wishlist</span>
                    </Link>
                </Button>
                <CartSheet />
                <UserButton />
              </div>
              <ThemeToggle />
              <div className="md:hidden flex items-center gap-1">
                <UserButton />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu (Now handled by BottomNavbar, this can be removed or repurposed) */}
      </>
  );
}
