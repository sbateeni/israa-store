"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Edit } from "lucide-react";

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

interface ProductListProps {
  refreshTrigger: number;
  onEditProduct: (product: Product) => void;
}

export default function ProductList({ refreshTrigger, onEditProduct }: ProductListProps) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

  // تحميل المنتجات
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, [refreshTrigger]);

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

  // دالة للتنقل بين الصور
  const goToPrev = (productId: string, mediaLength: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0 - 1 + mediaLength) % mediaLength
    }));
  };

  const goToNext = (productId: string, mediaLength: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0 + 1) % mediaLength
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>المنتجات الحالية ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {products.map((product) => {
            // تجميع الصور والفيديوهات
            const media = product.images && product.images.length > 0
              ? product.images
              : product.image
                ? [{ url: product.image, isMain: true }]
                : [];
            const currentIndex = currentImageIndex[product.id] || 0;

            return (
              <div key={product.id} className="border p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* معرض الصور والفيديوهات */}
                  <div className="relative aspect-square w-full max-w-xs">
                    {media.length > 0 ? (
                      media[currentIndex].url.endsWith('.mp4') || media[currentIndex].url.endsWith('.webm') || media[currentIndex].url.endsWith('.ogg') ? (
                        <video
                          src={media[currentIndex].url}
                          controls
                          className="object-cover rounded-lg w-full h-full"
                        />
                      ) : (
                        <Image
                          src={media[currentIndex].url}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      )
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground rounded-lg">
                        لا توجد صورة
                      </div>
                    )}
                    
                    {/* أسهم التنقل */}
                    {media.length > 1 && (
                      <>
                        <button
                          onClick={() => goToPrev(product.id, media.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 z-10"
                          aria-label="السابق"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => goToNext(product.id, media.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 z-10"
                          aria-label="التالي"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        {/* مؤشر الصور */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {media.map((_, idx) => (
                            <span
                              key={idx}
                              className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-primary' : 'bg-white/60'} border border-primary/30`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* معلومات المنتج */}
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <p className="text-lg font-bold text-primary">{product.price} ₪</p>
                        <p className="text-sm text-gray-700 mt-2">{product.description}</p>
                        
                        {/* معلومات الصور */}
                        {media.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500">
                            {media.length} {media.length === 1 ? 'صورة' : 'صور'}
                            {media.some(m => m.isMain) && ' • صورة رئيسية محددة'}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          تعديل
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {products.length === 0 && (
            <p className="text-center text-gray-500">لا توجد منتجات حالياً</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 