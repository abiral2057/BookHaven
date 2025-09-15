import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-foreground">Orders</h1>
      <p className="text-muted-foreground">View and manage customer orders.</p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Functionality to view orders and update their status will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground italic">Coming soon...</p>
        </CardContent>
      </Card>
    </>
  );
}
