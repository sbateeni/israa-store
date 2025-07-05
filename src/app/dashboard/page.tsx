"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { ProductForm, ProductList, SocialLinksForm, PasswordForm } from "@/components/dashboard";

export default function DashboardPage() {
  const { loading, error } = useSettings();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProductAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            خطأ في تحميل الإعدادات: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">لوحة التحكم</h1>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
          <TabsTrigger value="social">روابط التواصل</TabsTrigger>
          <TabsTrigger value="password">كلمة المرور</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <ProductForm onProductAdded={handleProductAdded} />
          <ProductList refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <SocialLinksForm />
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <PasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
} 