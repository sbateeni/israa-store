import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="container py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                    <CardDescription>Product management is now handled directly in the code.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Code-Based Management
                            </CardTitle>
                            <Lightbulb className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                               To add, edit, or remove products, please modify the file at `src/lib/products.ts`.
                            </p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
}
