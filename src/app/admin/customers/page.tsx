import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CustomersPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-foreground">Customers</h1>
      <p className="text-muted-foreground">View and manage your customer data.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>
            Functionality to view customer details and order history will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground italic">Coming soon...</p>
        </CardContent>
      </Card>
    </>
  );
}
