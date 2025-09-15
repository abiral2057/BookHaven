"use client";

import { useState, useEffect, useRef } from "react";
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
import { addCategory, getCategories, Category } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, BookOpen } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().min(1, "Description is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const defaultCategories = [
    { name: 'Fiction', description: 'Imaginative narrative, rather than history or fact.' },
    { name: 'Science Fiction', description: 'Fiction based on imagined future scientific or technological advances.' },
    { name: 'Mystery', description: 'Fiction dealing with the solution of a crime or the unraveling of secrets.' },
    { name: 'Biography', description: 'An account of someone\'s life written by someone else.' },
    { name: 'History', description: 'The study of past events, particularly in human affairs.' },
];

export default function CategoriesPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const seeded = useRef(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const fetchedCategories = await getCategories();
      
      if (fetchedCategories.length === 0 && !seeded.current) {
        seeded.current = true; // Prevents re-seeding
        await Promise.all(defaultCategories.map(cat => addCategory(cat)));
        const newCategories = await getCategories();
        setCategories(newCategories);
         toast({
          title: "Sample Categories Added",
          description: "A few example categories have been added to your database.",
        });
      } else {
        setCategories(fetchedCategories);
      }

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch categories.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      await addCategory(data);
      toast({
        title: "Success",
        description: "Category added successfully.",
      });
      form.reset();
      setIsAdding(false);
      fetchCategories();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add category. Please try again.",
      });
      console.error("Error adding category:", error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Categories</h1>
          <p className="text-muted-foreground">
            Organize your books into categories.
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {isAdding ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>
              Fill out the form below to add a new book category.
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
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Science Fiction" {...field} />
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
                          placeholder="Describe the category..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Category List</CardTitle>
            <CardDescription>
              Here are all the categories in your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading categories...</p>
            ) : categories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No categories yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first book category.</p>
                 <Button className="mt-6" onClick={() => setIsAdding(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
