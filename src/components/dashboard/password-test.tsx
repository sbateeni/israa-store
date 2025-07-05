"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";

interface PasswordTestData {
  encryptedPassword: string;
  decryptedPassword: string;
  isEncrypted: boolean;
  isBase64: boolean;
  passwordLength: number;
  blobUrl: string;
  fileSize: number;
}

export default function PasswordTest() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState<PasswordTestData | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const testPassword = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/test-password', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTestData(result.data);
        toast({
          title: "تم الاختبار بنجاح",
          description: "تم فحص كلمة المرور الحالية",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'فشل اختبار كلمة المرور');
      }
    } catch (error) {
      console.error('Error testing password:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل اختبار كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          اختبار كلمة المرور
        </CardTitle>
        <CardDescription>
          فحص حالة كلمة المرور الحالية في Vercel Blob Storage
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button
          onClick={testPassword}
          disabled={loading}
          className="w-full"
        >
          <TestTube className="h-4 w-4 mr-2" />
          {loading ? "جاري الاختبار..." : "اختبار كلمة المرور"}
        </Button>

        {testData && (
          <div className="space-y-4">
            <Alert className={testData.isEncrypted ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CheckCircle className={`h-4 w-4 ${testData.isEncrypted ? 'text-green-600' : 'text-red-600'}`} />
              <AlertDescription>
                <strong>حالة التشفير:</strong> {testData.isEncrypted ? "مشفرة" : "غير مشفرة"}
              </AlertDescription>
            </Alert>

            <Alert className={testData.isBase64 ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
              <AlertTriangle className={`h-4 w-4 ${testData.isBase64 ? 'text-green-600' : 'text-orange-600'}`} />
              <AlertDescription>
                <strong>تنسيق Base64:</strong> {testData.isBase64 ? "صحيح" : "غير صحيح"}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-semibold mb-2">كلمة المرور المشفرة:</h4>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded break-all">
                  {testData.encryptedPassword}
                </p>
              </div>

              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">كلمة المرور الحقيقية:</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {showPassword ? testData.decryptedPassword : '••••••••'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 border rounded-lg">
                <strong>طول كلمة المرور:</strong> {testData.passwordLength} حرف
              </div>
              <div className="p-3 border rounded-lg">
                <strong>حجم الملف:</strong> {testData.fileSize} بايت
              </div>
              <div className="p-3 border rounded-lg">
                <strong>Blob URL:</strong>
                <a 
                  href={testData.blobUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block truncate"
                >
                  عرض الملف
                </a>
              </div>
            </div>

            {!testData.isEncrypted && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <strong>تحذير:</strong> كلمة المرور غير مشفرة. استخدم زر "تشفير كلمة المرور" لتأمينها.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 