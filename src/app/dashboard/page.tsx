import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCode, FilePlus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    return (
        <div className="container py-10">
            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Product Management</h1>
                    <p className="text-muted-foreground">
                        All products are now managed directly inside your project's code.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileCode className="h-5 w-5" />
                            Your Product Database
                        </CardTitle>
                        <CardDescription>
                           The file <code className="font-mono bg-muted px-1 py-0.5 rounded">src/lib/products.ts</code> is your new database. All changes are made here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard/products">View All Products</Link>
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FilePlus className="h-5 w-5 text-green-500" /> To Add a Product</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                           <p>1. Add your new image to the <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">public/products</code> folder.</p>
                           <p>2. Open <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">src/lib/products.ts</code>.</p>
                           <p>3. Copy an existing product object, paste it, and update its `id`, `name`, `price`, and `image` path (e.g., <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">'/products/your-image.jpg'</code>).</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Pencil className="h-5 w-5 text-blue-500" /> To Edit a Product</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>1. Open <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">src/lib/products.ts</code>.</p>
                            <p>2. Find the product you want to change by its `id` or `name`.</p>
                            <p>3. Modify any of its details like `price`, `description`, etc.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trash2 className="h-5 w-5 text-red-500" /> To Delete a Product</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                           <p>1. Open <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">src/lib/products.ts</code>.</p>
                           <p>2. Find the product object you want to remove.</p>
                           <p>3. Delete the entire object from the array, including the curly braces <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">{`{...}`}</code> and the comma after it.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
