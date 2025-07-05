"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useDashboardPassword } from "@/hooks/use-dashboard-password";
import { Eye, EyeOff, AlertCircle, Lock, Shield } from "lucide-react";

export default function PasswordForm() {
  const { toast } = useToast();
  const { password: currentPassword, loading, error, updatePassword, refreshPassword } = useDashboardPassword();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = async () => {
    console.log('=== handleSavePassword called ===');
    console.log('Current password from hook:', currentPassword);
    console.log('Entered current password:', passwordForm.currentPassword);
    
    // التحقق من كلمة المرور الحالية
    if (passwordForm.currentPassword !== currentPassword) {
      console.log('Current password mismatch');
      toast({
        title: "خطأ",
        description: "كلمة المرور الحالية غير صحيحة",
        variant: "destructive",
      });
      return;
    }

    if (!passwordForm.newPassword) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال كلمة المرور الجديدة",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة وتأكيدها غير متطابقين",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    setSavingPassword(true);
    try {
      console.log('Calling updatePassword with new password');
      const success = await updatePassword(passwordForm.newPassword);
      
      if (success) {
        console.log('Password update successful');
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم تغيير كلمة المرور بنجاح في Vercel Blob Storage",
        });
        
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        
        // إعادة تحميل كلمة المرور الجديدة
        console.log('Refreshing password after update');
        await refreshPassword();
        
        // إضافة تأخير قصير للتأكد من التحديث
        setTimeout(() => {
          console.log('Final password check after update:', currentPassword);
        }, 1000);
      } else {
        throw new Error('فشل تغيير كلمة المرور');
      }
    } catch (error) {
      console.error('Error in handleSavePassword:', error);
      toast({
        title: "خطأ",
        description: "فشل تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">جاري تحميل كلمة المرور...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              خطأ في تحميل كلمة المرور: {error}
              <br />
              <Button 
                onClick={refreshPassword} 
                className="mt-2"
                variant="outline"
                size="sm"
              >
                إعادة المحاولة
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          تغيير كلمة مرور لوحة التحكم
        </CardTitle>
        <p className="text-sm text-gray-600">
          قم بتغيير كلمة المرور للوصول إلى لوحة التحكم
        </p>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            <strong>كلمة المرور الحالية:</strong> {currentPassword}
            <br />
            <span className="text-xs text-gray-500">
              محفوظة في Vercel Blob Storage - آمنة ومخفية عن GitHub
            </span>
            <br />
            <Button 
              onClick={refreshPassword} 
              className="mt-2"
              variant="outline"
              size="sm"
            >
              إعادة تحميل كلمة المرور
            </Button>
          </AlertDescription>
        </Alert>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block mb-1 font-medium">كلمة المرور الحالية</label>
            <div className="relative">
              <Input
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="كلمة المرور الحالية"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">كلمة المرور الجديدة</label>
            <div className="relative">
              <Input
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="كلمة المرور الجديدة"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">تأكيد كلمة المرور الجديدة</label>
            <div className="relative">
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="تأكيد كلمة المرور الجديدة"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <Button 
            onClick={handleSavePassword} 
            disabled={savingPassword}
            className="w-full"
          >
            {savingPassword ? "جاري الحفظ..." : "تغيير كلمة المرور"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 