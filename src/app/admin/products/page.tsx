import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProductsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-foreground">Products</h1>
      <p className="text-muted-foreground">Manage your products, inventory, and variants.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            Functionality to create, update, and delete products will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground italic">Coming soon...</p>
        </CardContent>
      </Card>
    </>
  );
}
