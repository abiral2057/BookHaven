import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CategoriesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-foreground">Categories</h1>
      <p className="text-muted-foreground">Organize your products into categories and subcategories.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>
            Functionality to create, update, and delete categories will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground italic">Coming soon...</p>
        </CardContent>
      </Card>
    </>
  );
}
