'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product, ProductCategory } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const newProductData = {
      name: formData.get('name') as string || 'Untitled Product',
      description: formData.get('description') as string || 'No description.',
      price: Number(formData.get('price')) || 0,
      category: (formData.get('category') as ProductCategory) || 'Perfumes',
      image: formData.get('image') as string || 'https://placehold.co/600x600.png',
      dataAiHint: formData.get('dataAiHint') as string | undefined,
    };
    
    try {
      const existingProductsJSON = localStorage.getItem('safaa-products');
      const existingProducts: Product[] = existingProductsJSON ? JSON.parse(existingProductsJSON) : [];
      
      const productWithId: Product = {
          ...newProductData,
          id: `local-${Date.now()}`,
      };

      const updatedProducts = [...existingProducts, productWithId];
      localStorage.setItem('safaa-products', JSON.stringify(updatedProducts));

      toast({
        title: 'Product Added Locally',
        description: 'The product has been saved to your browser\'s local storage.',
      });
      
      router.push('/dashboard/products');

    } catch (error) {
      console.error('Failed to save product to local storage', error);
      toast({
        title: 'Error',
        description: 'Could not save the product. Check browser permissions for local storage.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container py-10">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add a Product Locally</CardTitle>
          <CardDescription>
            Products added here are saved in your browser's local storage and won't be stored in Firebase.
            For the image, provide a path to an image in your `public` folder (e.g., `/images/my-perfume.jpg`).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Golden Dust"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A short, catchy description..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="price">Price (₪)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 250"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" defaultValue="Perfumes">
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Perfumes">Perfumes</SelectItem>
                            <SelectItem value="Apparel">Apparel</SelectItem>
                            <SelectItem value="Creams">Creams</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Product Image Path</Label>
              <Input
                id="image"
                name="image"
                type="text"
                placeholder="e.g., /perfume1.png (must be in public folder)"
              />
               <p className="text-xs text-muted-foreground">Instead of uploading, provide the path to an image located in the project's `public` folder.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataAiHint">Image AI Hint</Label>
              <Input
                id="dataAiHint"
                name="dataAiHint"
                placeholder="e.g., perfume bottle"
              />
              <p className="text-xs text-muted-foreground">Optional. One or two keywords for image search.</p>
            </div>
            <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding Product...' : 'Add Product Locally'}
                </Button>
                <Button variant="outline" asChild><Link href="/dashboard/products">Cancel</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
