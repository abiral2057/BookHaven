

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/hooks/use-cart';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from 'next-themes';
import { WishlistProvider } from '@/hooks/use-wishlist';
import { BottomNavbar } from '@/components/layout/bottom-navbar';
import { ProgressBar } from '@/components/layout/progress-bar';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'BookHaven',
  description: 'Your modern online bookstore.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased pb-20 md:pb-0">
         <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <Suspense>
                    <ProgressBar />
                  </Suspense>
                  {children}
                  <BottomNavbar />
                  <Toaster />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
