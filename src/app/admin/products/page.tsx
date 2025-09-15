"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addProduct, type Product } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().min(0, "Stock must be a positive number"),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductsPage() {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const newProduct: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
        ...data,
        images: [],
        category: "default",
      };
      await addProduct(newProduct);
      toast({
        title: "Success",
        description: "Product added successfully.",
      });
      form.reset();
      setIsAdding(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product. Please try again.",
      });
      console.error("Error adding product:", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your products, inventory, and variants.
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {isAdding ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
            <CardDescription>
              Fill out the form below to add a new product to your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Vintage T-Shirt" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the product..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Product Management</CardTitle>
            <CardDescription>
              Here you will be able to see and manage all your products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic">
              No products yet. Click "Add Product" to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}