"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MultiImageUpload from "./multi-image-upload";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: { url: string; isMain: boolean }[];
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

  const [productImages, setProductImages] = useState<{ url: string; isMain: boolean }[]>([]);
  const [savingProduct, setSavingProduct] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // معالجة تغيير الصور
  const handleImagesChange = (images: { url: string; isMain: boolean }[]) => {
    setProductImages(images);
    
    // تحديث الصورة الرئيسية في النموذج
    const mainImage = images.find(img => img.isMain);
    if (mainImage) {
      setForm(prev => ({ ...prev, image: mainImage.url }));
    }
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

    // التحقق من وجود صور
    if (productImages.length === 0 && !form.image) {
      toast({
        title: "خطأ",
        description: "يرجى رفع صورة واحدة على الأقل للمنتج",
        variant: "destructive",
      });
      return;
    }

    setSavingProduct(true);
    try {
      // تحديد الصورة الرئيسية
      let mainImageUrl = form.image;
      if (productImages.length > 0) {
        const mainImage = productImages.find(img => img.isMain);
        if (mainImage) {
          mainImageUrl = mainImage.url;
        } else {
          mainImageUrl = productImages[0].url; // أول صورة كرئيسية
        }
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
          image: mainImageUrl,
          images: productImages.length > 0 ? productImages : undefined,
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
        setProductImages([]);
        
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>إضافة منتج جديد</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* معلومات المنتج الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              اسم المنتج *
            </label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              placeholder="أدخل اسم المنتج"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              السعر *
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            الفئة *
          </label>
          <Input
            id="category"
            name="category"
            value={form.category}
            onChange={handleInputChange}
            placeholder="مثال: إلكترونيات، ملابس، أثاث"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            وصف المنتج *
          </label>
          <Textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="أدخل وصفاً مفصلاً للمنتج"
            rows={4}
            required
          />
        </div>

        {/* رفع الصور المتعددة */}
        <MultiImageUpload
          onImagesChange={handleImagesChange}
          maxImages={10}
          maxSize={4}
        />

        {/* رابط صورة بديل (اختياري) */}
        <div className="space-y-2">
          <label htmlFor="image" className="text-sm font-medium">
            رابط صورة بديل (اختياري)
          </label>
          <Input
            id="image"
            name="image"
            value={form.image}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-gray-500">
            يمكنك إضافة رابط صورة بديل إذا لم ترفع صوراً أعلاه
          </p>
        </div>

        <Button
          onClick={handleSaveProduct}
          disabled={savingProduct}
          className="w-full"
        >
          {savingProduct ? "جاري الحفظ..." : "حفظ المنتج"}
        </Button>
      </CardContent>
    </Card>
  );
} 