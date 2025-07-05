"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogOut } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ProductForm, ProductList, SocialLinksForm } from "@/components/dashboard";
import UnifiedPasswordManager from "@/components/dashboard/unified-password-manager";

export default function DashboardPage() {
  const { loading, error } = useSettings();
  const { isAuthenticated, isLoading: authLoading, logout, requireAuth } = useAuth();
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProductAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "تم تسجيل الخروج",
      description: "تم تسجيل الخروج بنجاح",
    });
  };

  // التحقق من المصادقة عند تحميل الصفحة
  useEffect(() => {
    if (!authLoading) {
      requireAuth();
    }
  }, [authLoading, requireAuth]);

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">جاري التحقق من المصادقة...</p>
          </div>
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخول، لا تعرض المحتوى
  if (!isAuthenticated) {
    return null;
  }

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
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
          <TabsTrigger value="social">روابط التواصل</TabsTrigger>
          <TabsTrigger value="password">كلمة المرور</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">إدارة المنتجات</h2>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
            >
              <LogOut className="h-3 w-3" />
              تسجيل الخروج
            </Button>
          </div>
          <ProductForm onProductAdded={handleProductAdded} />
          <ProductList refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">روابط التواصل</h2>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
            >
              <LogOut className="h-3 w-3" />
              تسجيل الخروج
            </Button>
          </div>
          <SocialLinksForm />
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">إدارة كلمة المرور</h2>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
            >
              <LogOut className="h-3 w-3" />
              تسجيل الخروج
            </Button>
          </div>
          <UnifiedPasswordManager />
        </TabsContent>
      </Tabs>

      {/* زر تسجيل الخروج إضافي في الأسفل */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex justify-center">
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج من لوحة التحكم
          </Button>
        </div>
      </div>
    </div>
  );
} 