"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  snapchat?: string;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const { 
    socialLinks, 
    dashboardPassword, 
    loading, 
    error, 
    saveSocialLinks, 
    saveDashboardPassword 
  } = useSettings();
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [socialForm, setSocialForm] = useState({
    whatsapp: "",
    facebook: "",
    instagram: "",
    snapchat: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // تحميل المنتجات والملفات
  useEffect(() => {
    const loadData = async () => {
      try {
        // تحميل المنتجات
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }

        // تحميل الملفات المحفوظة (من localStorage)
        const savedFiles = localStorage.getItem('uploadedFiles');
        if (savedFiles) {
          try {
            const files = JSON.parse(savedFiles);
            setUploadedFiles(files);
          } catch (error) {
            console.error('Error parsing saved files:', error);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  // معالجة اختيار الملفات
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  // رفع الملفات
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملفات للرفع",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of selectedFiles) {
        // التحقق من نوع الملف
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
        if (!validTypes.includes(file.type)) {
          toast({
            title: "خطأ",
            description: `نوع الملف ${file.name} غير مدعوم`,
            variant: "destructive",
          });
          continue;
        }

        // التحقق من حجم الملف (10MB كحد أقصى)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "خطأ",
            description: `حجم الملف ${file.name} كبير جداً (الحد الأقصى 10MB)`,
            variant: "destructive",
          });
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', `products-media/${Date.now()}-${file.name}`);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
          toast({
            title: "تم الرفع بنجاح",
            description: `تم رفع ${file.name} بنجاح`,
          });
        } else {
          throw new Error(`فشل رفع ${file.name}`);
        }
      }

      const newFiles = [...uploadedFiles, ...uploadedUrls];
      setUploadedFiles(newFiles);
      localStorage.setItem('uploadedFiles', JSON.stringify(newFiles));
      setSelectedFiles([]);
      
      if (uploadedUrls.length > 0) {
        toast({
          title: "تم الرفع بنجاح",
          description: `تم رفع ${uploadedUrls.length} ملف بنجاح`,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل رفع بعض الملفات",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // نسخ رابط الملف
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "تم النسخ",
      description: "تم نسخ الرابط إلى الحافظة",
    });
  };

  // حذف ملف من القائمة
  const removeFile = (url: string) => {
    const newFiles = uploadedFiles.filter(file => file !== url);
    setUploadedFiles(newFiles);
    localStorage.setItem('uploadedFiles', JSON.stringify(newFiles));
  };

  const handleSaveProduct = async () => {
    if (!form.name || !form.description || !form.price || !form.category || !form.image) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setSavingProduct(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
        }),
      });

      if (response.ok) {
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم إضافة المنتج بنجاح",
        });
        setForm({
          name: "",
          description: "",
          price: "",
          category: "",
          image: "",
        });
        
        // إعادة تحميل المنتجات
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          setProducts(data);
        }
      } else {
        throw new Error('فشل حفظ المنتج');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حفظ المنتج",
        variant: "destructive",
      });
    } finally {
      setSavingProduct(false);
    }
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

  const handleSavePassword = async () => {
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
      const success = await saveDashboardPassword(passwordForm.newPassword);
      
      if (success) {
        toast({
          title: "تم الحفظ بنجاح",
          description: "تم تغيير كلمة المرور بنجاح",
        });
        setPasswordForm({
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error('فشل تغيير كلمة المرور');
      }
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

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف المنتج بنجاح",
        });
        
        // إعادة تحميل المنتجات
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          setProducts(data);
        }
      } else {
        throw new Error('فشل حذف المنتج');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف المنتج",
        variant: "destructive",
      });
    }
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">إدارة المنتجات</TabsTrigger>
          <TabsTrigger value="media">إدارة الملفات</TabsTrigger>
          <TabsTrigger value="social">روابط التواصل</TabsTrigger>
          <TabsTrigger value="password">كلمة المرور</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {/* إضافة منتج جديد */}
          <Card>
            <CardHeader>
              <CardTitle>إضافة منتج جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">اسم المنتج</label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="اسم المنتج"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">الفئة</label>
                  <Input
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    placeholder="فئة المنتج"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">السعر (₪)</label>
                  <Input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">رابط الصورة</label>
                  <Input
                    name="image"
                    value={form.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  {form.image && (
                    <div className="mt-2">
                      <img 
                        src={form.image} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">وصف المنتج</label>
                  <Textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    placeholder="وصف المنتج..."
                    rows={3}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveProduct} 
                disabled={savingProduct}
                className="mt-4"
              >
                {savingProduct ? "جاري الحفظ..." : "إضافة المنتج"}
              </Button>
            </CardContent>
          </Card>

          {/* قائمة المنتجات */}
          <Card>
            <CardHeader>
              <CardTitle>المنتجات الحالية ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-lg font-bold text-primary">{product.price} ₪</p>
                        <p className="text-sm text-gray-700 mt-2">{product.description}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-center text-gray-500">لا توجد منتجات حالياً</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          {/* رفع ملفات جديدة */}
          <Card>
            <CardHeader>
              <CardTitle>رفع ملفات جديدة</CardTitle>
              <p className="text-sm text-gray-600">
                ارفع الصور والفيديوهات لاستخدامها في المنتجات
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">اختر الملفات</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يدعم: JPG, PNG, GIF, WebP, MP4, WebM, OGG (الحد الأقصى 10MB لكل ملف)
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">الملفات المختارة ({selectedFiles.length})</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleUploadFiles} 
                      disabled={uploading}
                      className="mt-4"
                    >
                      {uploading ? "جاري الرفع..." : `رفع ${selectedFiles.length} ملف`}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* الملفات المرفوعة */}
          <Card>
            <CardHeader>
              <CardTitle>الملفات المرفوعة ({uploadedFiles.length})</CardTitle>
              <p className="text-sm text-gray-600">
                انسخ الروابط لاستخدامها في المنتجات
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadedFiles.map((url, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img 
                              src={url} 
                              alt="Preview" 
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs">فيديو</span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{url.split('/').pop()}</p>
                            <p className="text-xs text-gray-500 truncate">{url}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(url)}
                        >
                          نسخ الرابط
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setForm(prev => ({ ...prev, image: url }))}
                        >
                          استخدم كصورة
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFile(url)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {uploadedFiles.length === 0 && (
                  <p className="text-center text-gray-500">لا توجد ملفات مرفوعة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تغيير كلمة مرور لوحة التحكم</CardTitle>
              <p className="text-sm text-gray-600">
                قم بتغيير كلمة المرور للوصول إلى لوحة التحكم
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block mb-1 font-medium">كلمة المرور الجديدة</label>
                  <Input
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="كلمة المرور الجديدة"
                    className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">يجب أن تكون 6 أحرف على الأقل</p>
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">تأكيد كلمة المرور</label>
                  <Input
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="تأكيد كلمة المرور الجديدة"
                    className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
        </TabsContent>
      </Tabs>
    </div>
  );
} 