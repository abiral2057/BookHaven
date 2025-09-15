import { Button } from '@/components/ui/button';
import { Gem, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Gem className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-[5rem] font-headline">
          Welcome to <span className="text-primary">SwiftStore</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          The modern e-commerce solution.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/admin/login">
              Go to Admin Panel <ArrowRight className="ml-2" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="#">
              Browse Products <span aria-hidden="true">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
