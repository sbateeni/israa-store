
'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, AlertTriangle, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { deleteProduct } from './actions';


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      let combinedProducts: Product[] = [];

      // 1. Load from localStorage
      try {
        const localProductsJSON = localStorage.getItem('safaa-products');
        if (localProductsJSON) {
          combinedProducts.push(...JSON.parse(localProductsJSON));
        }
      } catch (e) {
        console.warn("Could not parse local products", e);
      }
      
      // 2. Fetch from Firestore
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const firestoreProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        combinedProducts.push(...firestoreProducts);
      } catch (err: any) {
        console.error("Error fetching products: ", err);
        if (err.code === 'permission-denied') {
          setError("Permission Denied: Your security rules are blocking access to products. Please update your Firestore security rules to allow read operations.");
        } else {
          setError("An unexpected error occurred while fetching products.");
        }
      } finally {
        const uniqueProducts = Array.from(new Map(combinedProducts.map(p => [p.id, p])).values());
        setProducts(uniqueProducts);
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    startTransition(async () => {
      if (productToDelete.id.startsWith('local-')) {
        try {
          const localProductsJSON = localStorage.getItem('safaa-products');
          let localProducts: Product[] = localProductsJSON ? JSON.parse(localProductsJSON) : [];
          const updatedLocalProducts = localProducts.filter(p => p.id !== productToDelete.id);
          localStorage.setItem('safaa-products', JSON.stringify(updatedLocalProducts));
          
          setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
          toast({ title: 'Success', description: 'Product deleted from local storage.' });
        } catch (e) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not delete local product.' });
        }
      } else {
        const result = await deleteProduct(productToDelete.id);
        if (result.success) {
          setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete.id));
          toast({ title: 'Success', description: result.message });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
      }
      setIsAlertOpen(false);
      setProductToDelete(null);
    });
  };

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your products here. Locally added products are also shown.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Fetching Products</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.image || 'https://placehold.co/600x600.png'}
                        width="64"
                        data-ai-hint={product.dataAiHint}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price} ₪</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/products/edit/${product.id}`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(product)} className="text-destructive focus:bg-destructive/20 focus:text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !error && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No products found.
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
              {isPending ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

