import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { getOrders, getProducts, Order, Product } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const stats = [
    { title: "Total Revenue", value: "₹45,231.89", change: "+20.1% from last month", icon: DollarSign },
    { title: "Subscriptions", value: "+2350", change: "+180.1% from last month", icon: Users },
    { title: "Sales", value: "+12,234", change: "+19% from last month", icon: CreditCard },
    { title: "Active Now", value: "+573", change: "+201 since last hour", icon: Activity },
];

function getStatusVariant(status: Order['status']) {
    switch (status) {
        case 'Pending': return 'default';
        case 'Shipped': return 'secondary';
        case 'Delivered': return 'outline';
        default: return 'default';
    }
};

export default async function DashboardPage() {
    const recentOrders = await getOrders(5);
    const topProducts = await getProducts(5);

    return (
        <>
            <h1 className="text-3xl font-bold text-foreground font-headline">Dashboard</h1>
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
                        {recentOrders.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="font-medium">{order.customer.name}</div>
                                                <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                                            </TableCell>
                                            <TableCell>₹{order.total.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground italic">No recent orders.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Products</CardTitle>
                        <CardDescription>Your most recently added products.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topProducts.length > 0 ? (
                             <div className="space-y-4">
                                {topProducts.map((product) => (
                                    <div key={product.id} className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                                        </div>
                                        <p className="font-semibold">₹{product.price.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">No products found.</p>
                        )}
                         <Button asChild variant="outline" className="w-full mt-6">
                            <Link href="/admin/products">View All Books <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
