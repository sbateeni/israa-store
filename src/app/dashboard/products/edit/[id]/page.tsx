'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lightbulb } from 'lucide-react';

export default function EditProductPage() {

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
                    <CardTitle>Edit Product</CardTitle>
                    <CardDescription>
                       Product management is now handled directly in code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-6 bg-secondary/50 rounded-lg flex items-start gap-4">
                        <Lightbulb className="h-6 w-6 text-primary mt-1"/>
                        <div>
                            <h3 className="font-semibold">How to Edit a Product</h3>
                            <p className="text-muted-foreground mt-2">
                                To edit a product, please open the file <code className="font-mono bg-muted px-1 py-0.5 rounded">src/lib/products.ts</code>, find the product, and modify its details.
                            </p>
                             <Button variant="secondary" className="mt-4" asChild>
                                <Link href="/dashboard">View Full Instructions</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
