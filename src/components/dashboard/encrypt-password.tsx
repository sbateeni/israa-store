"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, AlertTriangle } from "lucide-react";

export default function EncryptPassword() {
  const { toast } = useToast();
  const [encrypting, setEncrypting] = useState(false);

  const handleEncryptPassword = async () => {
    setEncrypting(true);
    try {
      const response = await fetch('/api/encrypt-current-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "تم التشفير بنجاح",
        description: "تم تشفير كلمة المرور الحالية في Vercel Blob Storage",
      });

      console.log('Password encryption result:', result);
      
      // إعادة تحميل الصفحة بعد ثانيتين
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error encrypting password:', error);
      toast({
        title: "خطأ",
        description: "فشل تشفير كلمة المرور الحالية",
        variant: "destructive",
      });
    } finally {
      setEncrypting(false);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <Shield className="h-5 w-5" />
          تشفير كلمة المرور الحالية
        </CardTitle>
        <p className="text-sm text-red-700">
          تطبيق التشفير على كلمة المرور الموجودة في Vercel Blob Storage
        </p>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-red-200 bg-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>تحذير:</strong> كلمة المرور الحالية غير مشفرة في Blob Storage
            <br />
            <strong>الحل:</strong> تطبيق التشفير على الملف الحالي
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <p className="text-sm text-red-700">
            هذا الإجراء سيقوم بتشفير كلمة المرور الحالية "israa2026" وحفظها بشكل مشفر في Vercel Blob Storage.
          </p>
          
          <Button 
            onClick={handleEncryptPassword} 
            disabled={encrypting}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {encrypting ? "جاري التشفير..." : "تشفير كلمة المرور الحالية"}
          </Button>
          
          <p className="text-xs text-red-600">
            بعد التشفير، ستتم إعادة تحميل الصفحة تلقائياً
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 