
import { Breadcrumb } from "@/components/layout/breadcrumb";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <Breadcrumb />
      <h1 className="text-4xl font-bold text-center mt-8">About BookHaven</h1>
      <p className="text-muted-foreground text-center mt-4 max-w-2xl mx-auto">
        BookHaven is your modern online bookstore, created with the power of AI.
        Our mission is to provide a seamless and enjoyable experience for book lovers everywhere.
      </p>
    </div>
  );
}
