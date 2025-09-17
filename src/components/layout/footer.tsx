
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Book, Twitter, Facebook, Instagram } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function Footer() {
    const { isAdmin } = useAuth();

    return (
        <footer className="bg-card border-t border-border/60 text-card-foreground">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="md:col-span-1">
                         <Link href="/" className="flex items-center gap-2 mb-4">
                            <Book className="h-8 w-8 text-primary" />
                            <span className="text-2xl font-bold font-headline text-foreground">BookHaven</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Your modern online bookstore for discovering new worlds, one page at a time.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Navigation</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Home</Link></li>
                            <li><Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground">Shop</Link></li>
                            <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                            {isAdmin && (
                                <li><Link href="/admin/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Admin</Link></li>
                            )}
                        </ul>
                    </div>

                     {/* Social */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Follow Us</h3>
                        <div className="mt-4 flex space-x-4">
                           <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5"/></Link>
                           <Link href="#" className="text-muted-foreground hover:text-foreground"><Facebook className="h-5 w-5"/></Link>
                           <Link href="#" className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5"/></Link>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase">Newsletter</h3>
                        <p className="mt-4 text-sm text-muted-foreground">Subscribe for updates on new arrivals and special offers.</p>
                        <form className="mt-4 flex gap-2">
                            <Input type="email" placeholder="Enter your email" className="flex-1" />
                            <Button type="submit">Subscribe</Button>
                        </form>
                    </div>
                </div>

                <div className="mt-12 border-t border-border/60 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} BookHaven. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
