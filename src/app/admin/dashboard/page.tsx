import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

const stats = [
    { title: "Total Revenue", value: "$45,231.89", change: "+20.1% from last month", icon: DollarSign },
    { title: "Subscriptions", value: "+2350", change: "+180.1% from last month", icon: Users },
    { title: "Sales", value: "+12,234", change: "+19% from last month", icon: CreditCard },
    { title: "Active Now", value: "+573", change: "+201 since last hour", icon: Activity },
];

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">An overview of your store's performance.</p>
      
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
            </Card>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>A list of the most recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground italic">Recent orders will be displayed here.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Your best-selling products.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground italic">Top products will be displayed here.</p>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
