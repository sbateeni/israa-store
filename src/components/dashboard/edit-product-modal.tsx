"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: () => void;
}

export default function EditProductModal({ 
  product, 
  isOpen, 
  onClose, 
  onProductUpdated 
}: EditProductModalProps) {
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

  // تحميل بيانات المنتج عند فتح المودال
  useEffect(() => {
    if (product && isOpen) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        category: product.category || "",
        image: product.image || "",
      });
      
      // تحميل الصور الموجودة للمنتج
      const existingImages = product.images && product.images.length > 0 
        ? product.images 
        : product.image 
          ? [{ url: product.image, isMain: true }]
          : [];
      
      setProductImages(existingImages);
      console.log('EditProductModal: Loaded product images:', existingImages);
    }
  }, [product, isOpen]);

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
    if (!product) return;

    if (!form.name || !form.description || !form.price || !form.category) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
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

      // تحديث المنتج
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
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
          title: "تم التحديث بنجاح",
          description: "تم تحديث المنتج بنجاح",
        });
        
        onProductUpdated();
        onClose();
      } else {
        throw new Error('فشل تحديث المنتج');
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشل تحديث المنتج",
        variant: "destructive",
      });
    } finally {
      setSavingProduct(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل المنتج: {product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* معلومات المنتج الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium">
                اسم المنتج *
              </label>
              <Input
                id="edit-name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم المنتج"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-price" className="text-sm font-medium">
                السعر *
              </label>
              <Input
                id="edit-price"
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
            <label htmlFor="edit-category" className="text-sm font-medium">
              الفئة *
            </label>
            <Input
              id="edit-category"
              name="category"
              value={form.category}
              onChange={handleInputChange}
              placeholder="مثال: إلكترونيات، ملابس، أثاث"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-description" className="text-sm font-medium">
              وصف المنتج *
            </label>
            <Textarea
              id="edit-description"
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
                          maxSize={10}
            initialImages={productImages}
          />

          {/* رابط صورة بديل (اختياري) */}
          <div className="space-y-2">
            <label htmlFor="edit-image" className="text-sm font-medium">
              رابط صورة بديل (اختياري)
            </label>
            <Input
              id="edit-image"
              name="image"
              value={form.image}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500">
              يمكنك إضافة رابط صورة بديل إذا لم ترفع صوراً أعلاه
            </p>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={savingProduct}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={savingProduct}
            >
              {savingProduct ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 