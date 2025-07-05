"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

interface ProductFormProps {
  onProductAdded: () => void;
}

export default function ProductForm({ onProductAdded }: ProductFormProps) {
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // معالجة اختيار الملفات
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  // رفع ملف واحد واستخدامه كصورة للمنتج
  const uploadAndUseFile = async (file: File): Promise<string> => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      throw new Error(`نوع الملف ${file.name} غير مدعوم`);
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`حجم الملف ${file.name} كبير جداً (الحد الأقصى 10MB)`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', `products-media/${Date.now()}-${file.name}`);

    // Retry logic for 429 errors
    let retries = 3;
    let lastError: Error | null = null;

    while (retries > 0) {
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.status === 429) {
          // Rate limited - wait and retry
          const waitTime = (4 - retries) * 1000; // 1s, 2s, 3s
          console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries--;
          continue;
        }

        if (!response.ok) {
          throw new Error(`فشل رفع ${file.name}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.url;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (retries > 1) {
          console.log(`Upload failed, retrying... (${retries - 1} attempts left)`);
          retries--;
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          break;
        }
      }
    }

    throw lastError || new Error(`فشل رفع ${file.name} بعد عدة محاولات`);
  };

  const handleSaveProduct = async () => {
    if (!form.name || !form.description || !form.price || !form.category) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة (اسم المنتج، الوصف، السعر، الفئة)",
        variant: "destructive",
      });
      return;
    }

    // إذا لم يتم اختيار ملف ولم يتم إدخال رابط صورة
    if (selectedFiles.length === 0 && !form.image) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف أو إدخال رابط صورة",
        variant: "destructive",
      });
      return;
    }

    setSavingProduct(true);
    try {
      let imageUrl = form.image;

      // إذا تم اختيار ملف، قم برفعه أولاً
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0]; // نستخدم الملف الأول فقط
        imageUrl = await uploadAndUseFile(file);
        toast({
          title: "تم رفع الملف بنجاح",
          description: `تم رفع ${file.name} بنجاح`,
        });
      }

      // إضافة المنتج
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          image: imageUrl,
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
        setSelectedFiles([]);
        
        // إعادة تحميل المنتجات
        onProductAdded();
      } else {
        throw new Error('فشل حفظ المنتج');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل حفظ المنتج",
        variant: "destructive",
      });
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>إضافة منتج جديد</CardTitle>
        <p className="text-sm text-gray-600">
          اختر ملف صورة/فيديو أو أدخل رابط صورة مباشرة
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* اختيار الملف */}
          <div>
            <label className="block mb-2 font-medium">اختر ملف صورة أو فيديو</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              يدعم: JPG, PNG, GIF, WebP, MP4, WebM, OGG (الحد الأقصى 10MB)
            </p>
          </div>

          {/* عرض الملف المختار */}
          {selectedFiles.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">الملف المختار</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm">{selectedFiles[0].name}</span>
                <span className="text-xs text-gray-500">
                  {(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          )}

          {/* أو إدخال رابط صورة */}
          <div className="border-t pt-4">
            <label className="block mb-2 font-medium">أو أدخل رابط صورة مباشرة</label>
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

          {/* معلومات المنتج */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">معلومات المنتج</h4>
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
          </div>

          {/* زر إضافة المنتج */}
          <Button 
            onClick={handleSaveProduct} 
            disabled={savingProduct}
            className="w-full"
          >
            {savingProduct ? "جاري الإضافة..." : "إضافة المنتج"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 