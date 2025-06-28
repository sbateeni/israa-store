import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    return (
        <div className="container py-10">
            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Store Management</h1>
                    <p className="text-muted-foreground">
                        Add and manage your products via the code-based workflow.
                    </p>
                </div>

                <div className="grid md:grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <List className="h-5 w-5" />
                                Manage Products
                            </CardTitle>
                            <CardDescription>
                                View your product list and use the "Add Product" tool to generate code for new products.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild>
                                <Link href="/dashboard/products">Manage Products</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
