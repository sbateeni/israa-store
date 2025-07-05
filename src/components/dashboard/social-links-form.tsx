"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";

export default function SocialLinksForm() {
  const { toast } = useToast();
  const { 
    socialLinks, 
    loading, 
    error, 
    saveSocialLinks 
  } = useSettings();
  
  const [socialForm, setSocialForm] = useState({
    whatsapp: "",
    facebook: "",
    instagram: "",
    snapchat: "",
  });

  const [savingSocial, setSavingSocial] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // تحميل إعدادات التواصل الاجتماعي
  useEffect(() => {
    if (!loading && socialLinks) {
      setSocialForm({
        whatsapp: socialLinks.whatsapp || "",
        facebook: socialLinks.facebook || "",
        instagram: socialLinks.instagram || "",
        snapchat: socialLinks.snapchat || "",
      });
      setSettingsLoaded(true);
    }
  }, [loading, socialLinks]);

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSocialLinks = async () => {
    setSavingSocial(true);
    try {
      // تنسيق رابط واتساب
      let formattedSocial = { ...socialForm };
      if (formattedSocial.whatsapp && !formattedSocial.whatsapp.startsWith('https://wa.me/')) {
        if (formattedSocial.whatsapp.match(/^\d+$/)) {
          formattedSocial.whatsapp = `https://wa.me/${formattedSocial.whatsapp}`;
        }
      }

      const success = await saveSocialLinks(formattedSocial);
      
      if (success) {
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم حفظ روابط التواصل الاجتماعي بنجاح",
        });
        setSocialForm(formattedSocial);
      } else {
        throw new Error('فشل حفظ روابط التواصل');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ روابط التواصل الاجتماعي",
        variant: "destructive",
      });
    } finally {
      setSavingSocial(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm">جاري تحميل الإعدادات...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              خطأ في تحميل الإعدادات: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>روابط التواصل الاجتماعي</CardTitle>
        <p className="text-sm text-gray-600">
          هذه الروابط ستُستخدم تلقائياً في جميع المنتجات
        </p>
      </CardHeader>
      <CardContent>
        {!settingsLoaded && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>جاري تحميل الإعدادات...</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-green-600 font-medium">رقم واتساب</label>
            <Input
              name="whatsapp"
              type="text"
              value={socialForm.whatsapp}
              onChange={handleSocialChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="966500000000"
            />
            <p className="text-xs text-gray-500 mt-1">اكتب الرقم فقط بدون + (مثال: 966500000000)</p>
          </div>
          <div>
            <label className="block mb-1 text-blue-600 font-medium">رابط فيسبوك</label>
            <Input
              name="facebook"
              type="url"
              value={socialForm.facebook}
              onChange={handleSocialChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://facebook.com/username"
            />
          </div>
          <div>
            <label className="block mb-1 text-purple-600 font-medium">رابط انستغرام</label>
            <Input
              name="instagram"
              type="url"
              value={socialForm.instagram}
              onChange={handleSocialChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://instagram.com/username"
            />
          </div>
          <div>
            <label className="block mb-1 text-yellow-600 font-medium">رابط سناب شات</label>
            <Input
              name="snapchat"
              type="url"
              value={socialForm.snapchat}
              onChange={handleSocialChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://snapchat.com/add/username"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleSaveSocialLinks} 
          disabled={savingSocial || !settingsLoaded}
          className="mt-6"
        >
          {savingSocial ? "جاري الحفظ..." : "حفظ روابط التواصل"}
        </Button>
      </CardContent>
    </Card>
  );
} 