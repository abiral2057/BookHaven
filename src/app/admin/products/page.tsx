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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addProduct, getProducts, Product, getCategories, Category, updateProduct, deleteProduct } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Book, BookOpen, Sparkles, Loader2, MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { checkDbConnection } from "@/lib/firebase";
import { generateProductDescription } from "@/ai/flows/product-description-generator";

const productSchema = z.object({
  name: z.string().min(1, "Book title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  stock: z.coerce.number().min(0, "Stock must be a positive number"),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  category: z.string().min(1, "Please select a category"),
});

type ProductFormValues = z.infer<typeof productSchema>;

const defaultProducts = [
    { name: 'To Kill a Mockingbird', author: 'Harper Lee', description: 'A novel about the serious issues of rape and racial inequality.', price: 12.99, stock: 50, category: 'Fiction' },
    { name: '1984', author: 'George Orwell', description: 'A dystopian social science fiction novel and cautionary tale.', price: 10.99, stock: 30, category: 'Science Fiction' },
    { name: 'The Great Gatsby', author: 'F. Scott Fitzgerald', description: 'A novel about the American dream and its corruption.', price: 14.00, stock: 45, category: 'Fiction' },
    { name: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', description: 'A book that surveys the history of humankind.', price: 22.50, stock: 25, category: 'History' },
    { name: 'The Hobbit', author: 'J.R.R. Tolkien', description: 'A fantasy novel and children\'s book about the quest of hobbit Bilbo Baggins.', price: 18.00, stock: 60, category: 'Science Fiction' },
];


export default function ProductsPage() {
  const [formMode, setFormMode] = useState<"hidden" | "add" | "edit">("hidden");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { toast } = useToast();
  const seeded = useRef(false);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      author: "",
      description: "",
      price: 0,
      stock: 0,
      imageUrl: "",
      category: "",
    },
  });

  const fetchAllData = async () => {
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
         setProducts(fetchedProducts);
         setCategories(fetchedCategories);
         return { fetchedProducts, fetchedCategories };
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch data. Please ensure Firestore rules are correct.",
        });
        console.error("Error fetching data:", error);
        return { fetchedProducts: [], fetchedCategories: [] };
      }
  };


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { ready, error } = await checkDbConnection();
      if (!ready) {
        toast({
          variant: "destructive",
          title: "Database Connection Error",
          description: error || "Could not connect to the database.",
        });
        setIsLoading(false);
        return;
      }

      const { fetchedProducts, fetchedCategories } = await fetchAllData();
      
      if (fetchedProducts.length === 0 && !seeded.current && fetchedCategories.length > 0) {
          seeded.current = true;
          toast({
              title: "No Books Found",
              description: "Seeding your database with some sample books...",
          });

          const categoryMap = fetchedCategories.reduce((acc, cat) => {
              acc[cat.name] = cat.id;
              return acc;
          }, {} as Record<string, string>);

          await Promise.all(defaultProducts.map(p => addProduct({
              ...p,
              category: categoryMap[p.category],
              images: [`https://picsum.photos/seed/${p.name.replace(/\s/g, '-')}/400/600`],
          })));
          
          await fetchAllData();

           toast({
              title: "Sample Books Added!",
              description: "Your database now has some sample books.",
          });
      }
      setIsLoading(false);
    };
    
    fetchData();
  }, [toast]);

  const handleGenerateDescription = async () => {
    const title = form.getValues("name");
    const author = form.getValues("author");

    if (!title || !author) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a book title and author first.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductDescription({ keywords: `${title} by ${author}` });
      if (result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
        toast({
          title: "Description Generated!",
          description: "The AI-generated description has been added.",
        });
      } else {
        throw new Error("No description was returned.");
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate a description. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const productData = {
          ...data,
          images: data.imageUrl ? [data.imageUrl] : [],
      };

      if (formMode === 'edit' && editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast({ title: "Success", description: "Book updated successfully." });
      } else {
        await addProduct(productData);
        toast({ title: "Success", description: "Book added successfully." });
      }
      
      form.reset();
      setFormMode("hidden");
      setEditingProduct(null);
      
      setIsLoading(true);
      await fetchAllData();
      setIsLoading(false);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${formMode === 'edit' ? 'update' : 'add'} book. Your Firestore security rules may be blocking the operation.`,
      });
      console.error(`Error ${formMode === 'edit' ? 'updating' : 'adding'} book:`, error);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormMode("edit");
    form.reset({
      name: product.name,
      author: product.author,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.images?.[0] || '',
      category: product.category,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({
        title: "Success",
        description: "Book deleted successfully."
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete book.",
      });
       console.error("Error deleting book:", error);
    } finally {
      setProductToDelete(null);
    }
  };

  const openAddForm = () => {
    form.reset();
    setEditingProduct(null);
    setFormMode("add");
  };

  const closeForm = () => {
    setFormMode("hidden");
    setEditingProduct(null);
  };
  
  const formTitle = formMode === 'edit' ? "Edit Book" : "Add New Book";
  const formDescription = formMode === 'edit' ? "Update the details of this book." : "Fill out the form below to add a new book to your store.";
  const submitButtonText = formMode === 'edit' ? "Save Changes" : "Add Book";
  const submittingButtonText = formMode === 'edit' ? "Saving..." : "Adding...";

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-headline">Books</h1>
          <p className="text-muted-foreground">
            Manage your book inventory.
          </p>
        </div>
        {formMode === 'hidden' && (
          <Button onClick={openAddForm}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        )}
      </div>

      {formMode !== 'hidden' ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{formTitle}</CardTitle>
            <CardDescription>{formDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Book Title</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. The Great Gatsby" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Author</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. F. Scott Fitzgerald" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex items-center justify-between">
                        <FormLabel>Description</FormLabel>
                         <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                          {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Generate with AI
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the book..."
                          {...field}
                           rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/cover.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                             {categories.length === 0 && <p className="p-4 text-sm text-muted-foreground">No categories found. Please add one on the Categories page.</p>}
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    onClick={closeForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? submittingButtonText : submitButtonText}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Book List</CardTitle>
            <CardDescription>
              Here are all the books in your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Loading books...</div>
            ) : products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cover</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images && product.images[0] ? (
                           <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={64}
                            height={96}
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-24 w-16 bg-muted rounded-md flex items-center justify-center">
                            <Book className="h-8 w-8 text-muted-foreground"/>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.author}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{categories.find(c => c.id === product.category)?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditClick(product)}>
                                <Edit className="mr-2 h-4 w-4"/>
                                Edit
                              </DropdownMenuItem>
                              <AlertDialogTrigger asChild>
                                  <button
                                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full"
                                    onClick={() => setProductToDelete(product)}
                                  >
                                    <Trash className="mr-2 h-4 w-4 text-destructive" />
                                    <span className="text-destructive">Delete</span>
                                  </button>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-foreground">No books yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first book.</p>
                 <Button className="mt-6" onClick={openAddForm}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Book
                  </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
       <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book &quot;{productToDelete?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
