import Image from 'next/image';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, FileCode } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProductsPage() {
  return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Here are the products currently in your store.
                </CardDescription>
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
             <Alert className="mb-6">
                <FileCode className="h-4 w-4" />
                <AlertTitle>Manage Products in Code</AlertTitle>
                <AlertDescription>
                  All products are managed directly in the file: <code className="font-mono bg-secondary px-1 py-0.5 rounded">src/lib/products.ts</code>. 
                  To edit or delete a product, please modify this file.
                </AlertDescription>
            </Alert>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">
                            No products found in <code className="font-mono bg-secondary px-1 py-0.5 rounded">src/lib/products.ts</code>.
                        </TableCell>
                    </TableRow>
                ) : products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        alt={product.name}
                        className="aspect-square rounded-md object-cover"
                        height="64"
                        src={product.image || 'https://placehold.co/64x64.png'}
                        width="64"
                        data-ai-hint={product.dataAiHint}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price} ₪</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
