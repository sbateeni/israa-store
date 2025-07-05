"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [retrievedPassword, setRetrievedPassword] = useState<string | null>(null);

  const handleRetrievePassword = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/retrieve-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRetrievedPassword(data.password);
          toast({
            title: "تم استرجاع كلمة المرور",
            description: "تم استرجاع كلمة المرور بنجاح. يمكنك الآن نسخها.",
          });
        } else {
          toast({
            title: "خطأ",
            description: data.error || "فشل في استرجاع كلمة المرور",
            variant: "destructive",
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "خطأ",
          description: errorData.error || "حدث خطأ أثناء استرجاع كلمة المرور",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error retrieving password:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (retrievedPassword) {
      navigator.clipboard.writeText(retrievedPassword);
      toast({
        title: "تم النسخ",
        description: "تم نسخ كلمة المرور إلى الحافظة",
      });
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">استرجاع كلمة المرور</CardTitle>
            <p className="text-sm text-gray-600">
              استخدم هذا الخيار إذا نسيت كلمة مرور لوحة التحكم
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>تحذير أمني:</strong> هذا الخيار يستخدم Vercel Environment Variables لاسترجاع كلمة المرور. 
                تأكد من أنك في بيئة آمنة قبل استخدامه.
              </AlertDescription>
            </Alert>

            {!retrievedPassword ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  اضغط على الزر أدناه لاسترجاع كلمة المرور من Vercel Environment Variables
                </p>
                
                <Button 
                  onClick={handleRetrievePassword}
                  className="w-full flex items-center gap-2"
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4" />
                  {isLoading ? "جاري استرجاع كلمة المرور..." : "استرجاع كلمة المرور"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور المسترجعة:</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={retrievedPassword}
                      readOnly
                      className="w-full p-3 border rounded-lg pr-10 bg-gray-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopyPassword}
                    className="flex-1"
                    variant="outline"
                  >
                    نسخ كلمة المرور
                  </Button>
                  <Button 
                    onClick={() => setRetrievedPassword(null)}
                    className="flex-1"
                    variant="outline"
                  >
                    إخفاء
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button 
                onClick={handleBackToLogin}
                variant="ghost"
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة لصفحة تسجيل الدخول
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>هذا الخيار متاح فقط للمطورين المصرح لهم بالوصول إلى Vercel Environment Variables</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 