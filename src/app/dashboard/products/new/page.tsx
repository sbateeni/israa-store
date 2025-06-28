
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function NewProductPage() {

  return (
    <div className="container py-10">
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add a Product</CardTitle>
          <CardDescription>
            Product management is now handled directly in the code. To add a new product, please edit the file at `src/lib/products.ts`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
              <Button variant="outline" asChild><Link href="/dashboard">Return to Dashboard</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
