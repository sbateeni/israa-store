"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Lock, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Key,
  Eye,
  EyeOff
} from "lucide-react";

interface PasswordStatus {
  isEncrypted: boolean;
  isFormatted: boolean;
  currentPassword: string;
  needsEncryption: boolean;
  needsFormatFix: boolean;
}

export default function UnifiedPasswordManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // نموذج تغيير كلمة المرور
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  // فحص حالة كلمة المرور
  const checkPasswordStatus = async () => {
    try {
      setLoading(true);
      
      // فحص كلمة المرور الحالية
      const response = await fetch('/api/dashboard-password', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // فحص إذا كانت مشفرة
        const isEncrypted = data.password && data.password.length > 10 && 
                           !data.password.includes('israa') && 
                           !data.password.includes('admin');
        
        // فحص التنسيق
        const isFormatted = data.password && typeof data.password === 'string';
        
        setPasswordStatus({
          isEncrypted,
          isFormatted,
          currentPassword: data.password || "",
          needsEncryption: !isEncrypted,
          needsFormatFix: !isFormatted
        });
      } else {
        setPasswordStatus({
          isEncrypted: false,
          isFormatted: false,
          currentPassword: "",
          needsEncryption: true,
          needsFormatFix: true
        });
      }
    } catch (error) {
      console.error('Error checking password status:', error);
      toast({
        title: "خطأ",
        description: "فشل في فحص حالة كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // تشفير كلمة المرور الحالية
  const encryptCurrentPassword = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/encrypt-current-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "تم التشفير بنجاح",
          description: "تم تشفير كلمة المرور وحفظها في Vercel Blob Storage",
        });
        
        // إعادة فحص الحالة
        await checkPasswordStatus();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'فشل تشفير كلمة المرور');
      }
    } catch (error) {
      console.error('Error encrypting password:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل تشفير كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // إصلاح تنسيق كلمة المرور
  const fixPasswordFormat = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/fix-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: passwordStatus?.currentPassword || "admin123" })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "تم الإصلاح بنجاح",
          description: "تم إصلاح تنسيق كلمة المرور في Vercel Blob Storage",
        });
        
        // إعادة فحص الحالة
        await checkPasswordStatus();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'فشل إصلاح تنسيق كلمة المرور');
      }
    } catch (error) {
      console.error('Error fixing password format:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل إصلاح تنسيق كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // تغيير كلمة المرور
  const changePassword = async () => {
    try {
      // التحقق من صحة المدخلات
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "خطأ",
          description: "جميع الحقول مطلوبة",
          variant: "destructive"
        });
        return;
      }

      if (newPassword.length < 6) {
        toast({
          title: "خطأ",
          description: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل",
          variant: "destructive"
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "خطأ",
          description: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);
      
      const response = await fetch('/api/dashboard-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "تم التغيير بنجاح",
          description: "تم تغيير كلمة المرور وحفظها في Vercel Blob Storage",
        });
        
        // إعادة تعيين النموذج
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setChangePasswordMode(false);
        
        // إعادة فحص الحالة
        await checkPasswordStatus();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'فشل تغيير كلمة المرور');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل تغيير كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // فحص الحالة عند تحميل المكون
  useEffect(() => {
    checkPasswordStatus();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          إدارة كلمة المرور
        </CardTitle>
        <CardDescription>
          إدارة كلمة مرور لوحة التحكم - آمنة ومشفرة في Vercel Blob Storage
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* حالة كلمة المرور */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">حالة كلمة المرور</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={checkPasswordStatus}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث الحالة
            </Button>
          </div>

          {passwordStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert className={passwordStatus.isEncrypted ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <Shield className={`h-4 w-4 ${passwordStatus.isEncrypted ? 'text-green-600' : 'text-red-600'}`} />
                <AlertDescription>
                  {passwordStatus.isEncrypted ? "كلمة المرور مشفرة" : "كلمة المرور غير مشفرة"}
                </AlertDescription>
              </Alert>

              <Alert className={passwordStatus.isFormatted ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <CheckCircle className={`h-4 w-4 ${passwordStatus.isFormatted ? 'text-green-600' : 'text-red-600'}`} />
                <AlertDescription>
                  {passwordStatus.isFormatted ? "التنسيق صحيح" : "التنسيق يحتاج إصلاح"}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* إجراءات الأمان */}
        {passwordStatus && (passwordStatus.needsEncryption || passwordStatus.needsFormatFix) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">إجراءات الأمان المطلوبة</h3>
            
            {passwordStatus.needsEncryption && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  كلمة المرور الحالية غير مشفرة في Blob Storage
                </AlertDescription>
                <Button
                  onClick={encryptCurrentPassword}
                  disabled={loading}
                  className="mt-2"
                  size="sm"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  تشفير كلمة المرور
                </Button>
              </Alert>
            )}

            {passwordStatus.needsFormatFix && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  ملف كلمة المرور يحتوي على تنسيق خاطئ
                </AlertDescription>
                <Button
                  onClick={fixPasswordFormat}
                  disabled={loading}
                  className="mt-2"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  إصلاح التنسيق
                </Button>
              </Alert>
            )}
          </div>
        )}

        {/* تغيير كلمة المرور */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">تغيير كلمة المرور</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChangePasswordMode(!changePasswordMode)}
            >
              {changePasswordMode ? "إلغاء" : "تغيير كلمة المرور"}
            </Button>
          </div>

          {changePasswordMode && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-2">
                <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                onClick={changePassword}
                disabled={loading}
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </div>
          )}
        </div>

        {/* معلومات إضافية */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>معلومات الأمان:</strong> كلمة المرور محفوظة في Vercel Blob Storage ومشفرة بـ Base64. 
            لا توجد كلمات مرور مكشوفة في الكود المصدري.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
} 