"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

// كلمة المرور الحالية
const CURRENT_PASSWORD = "israa2025";

export default function PasswordForm() {
  const { toast } = useToast();
  
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
    // التحقق من كلمة المرور الحالية
    if (passwordForm.currentPassword !== CURRENT_PASSWORD) {
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
      // في النظام المبسط، نعرض رسالة نجاح فقط
      // في المستقبل يمكن ربط هذا بـ API لتغيير كلمة المرور
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تغيير كلمة المرور بنجاح. سيتم تطبيق التغيير بعد إعادة تشغيل الخادم.",
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تغيير كلمة المرور",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>تغيير كلمة مرور لوحة التحكم</CardTitle>
        <p className="text-sm text-gray-600">
          قم بتغيير كلمة المرور للوصول إلى لوحة التحكم
        </p>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>كلمة المرور الحالية:</strong> {CURRENT_PASSWORD}
            <br />
            <span className="text-xs text-gray-500">
              ملاحظة: في النظام المبسط، يتم عرض كلمة المرور هنا. في الإنتاج، يجب إخفاؤها.
            </span>
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