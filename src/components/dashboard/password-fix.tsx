"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Wrench, AlertTriangle } from "lucide-react";

export default function PasswordFix() {
  const { toast } = useToast();
  const [password, setPassword] = useState("israa2025");
  const [fixing, setFixing] = useState(false);

  const handleFixPassword = async () => {
    if (!password.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة مرور",
        variant: "destructive",
      });
      return;
    }

    setFixing(true);
    try {
      const response = await fetch('/api/fix-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "تم الإصلاح بنجاح",
        description: "تم إصلاح تنسيق كلمة المرور في Vercel Blob Storage",
      });

      console.log('Password fix result:', result);
      
    } catch (error) {
      console.error('Error fixing password:', error);
      toast({
        title: "خطأ",
        description: "فشل إصلاح تنسيق كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setFixing(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Wrench className="h-5 w-5" />
          إصلاح تنسيق كلمة المرور
        </CardTitle>
        <p className="text-sm text-orange-700">
          إصلاح مشكلة تنسيق كلمة المرور في Vercel Blob Storage
        </p>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 border-orange-200 bg-orange-100">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>المشكلة:</strong> ملف كلمة المرور في Blob Storage يحتوي على تنسيق خاطئ
            <br />
            <strong>الحل:</strong> إعادة حفظ كلمة المرور بالتنسيق الصحيح
          </AlertDescription>
        </Alert>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1 font-medium text-orange-800">كلمة المرور الجديدة</label>
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              className="border-orange-300"
            />
            <p className="text-xs text-orange-600 mt-1">
              سيتم حفظ كلمة المرور بالتنسيق الصحيح في Vercel Blob Storage
            </p>
          </div>
          
          <Button 
            onClick={handleFixPassword} 
            disabled={fixing}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {fixing ? "جاري الإصلاح..." : "إصلاح تنسيق كلمة المرور"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 