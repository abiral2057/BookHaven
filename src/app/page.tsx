import { Button } from '@/components/ui/button';
import { Book, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground">BookHaven</span>
          </div>
          <Button asChild variant="ghost">
            <Link href="/admin/login">Admin Login</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center text-center text-white">
          <Image 
            src="https://images.unsplash.com/photo-1491841550275-5b462bf985ca?q=80&w=2070&auto=format&fit=crop"
            alt="Library"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 p-4">
            <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight">
              Find Your Next Favorite Book
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/90">
              Explore our curated collection of classics and bestsellers.
            </p>
            <div className="mt-8">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Browse All Books <ArrowRight className="ml-2" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Featured Books Section */}
        <section className="py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold font-headline text-foreground">Featured Books</h2>
                    <p className="mt-2 text-lg text-muted-foreground">Handpicked selections just for you</p>
                </div>
                <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Placeholder for featured books */}
                    <div className="text-center text-muted-foreground italic col-span-full py-10">
                        Featured books will be displayed here soon...
                    </div>
                </div>
            </div>
        </section>

      </main>

      <footer className="border-t bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} BookHaven. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
