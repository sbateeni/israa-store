"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { formatSocialLink } = useSettings();

  // التحقق من صحة المنتج
  if (!product || typeof product !== 'object') {
    console.error('Invalid product:', product);
    return null;
  }

  // سلايدر الصور والفيديوهات
  const media = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [{ url: product.image, isMain: true }]
      : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const goToPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const handleAddToCart = () => {
    if (!product || !product.name) {
      toast({
        title: "خطأ",
        description: "لا يمكن إضافة منتج غير صحيح",
        variant: "destructive",
      });
      return;
    }
    
    addItem(product);
    toast({
      title: "تم الإضافة",
      description: `تم إضافة ${product.name} إلى السلة`,
    });
  };

  const handleSocialClick = (e: React.MouseEvent, url: string, platform: string) => {
    e.stopPropagation();
    
    if (!product) {
      toast({
        title: "خطأ",
        description: "منتج غير صحيح",
        variant: "destructive",
      });
      return;
    }
    
    // استخدام الإعدادات المحفوظة بدلاً من روابط المنتج
    const settingsLink = formatSocialLink(platform as 'whatsapp' | 'facebook' | 'instagram' | 'snapchat');
    
    if (settingsLink) {
      window.open(settingsLink, '_blank');
    } else {
      toast({
        title: "خطأ",
        description: `لم يتم تعيين رابط ${platform} في إعدادات الموقع`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      className="overflow-hidden group cursor-pointer flex flex-col h-full rounded-2xl shadow-md transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 bg-background"
      onClick={() => {
        if (product && product.name) {
          onViewDetails(product);
        } else {
          toast({
            title: "خطأ",
            description: "لا يمكن عرض تفاصيل منتج غير صحيح",
            variant: "destructive",
          });
        }
      }}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
          {media.length > 0 ? (
            media[currentIndex].url.endsWith('.mp4') || media[currentIndex].url.endsWith('.webm') || media[currentIndex].url.endsWith('.ogg') ? (
              <video
                src={media[currentIndex].url}
                controls
                className="object-cover rounded-t-2xl w-full h-full"
              />
            ) : (
              <Image
                src={media[currentIndex].url}
                alt={product.name || 'Product'}
                data-ai-hint={product.dataAiHint}
                fill
                className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-110 group-hover:brightness-105"
              />
            )
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              لا توجد صورة
            </div>
          )}
          {/* أسهم التنقل */}
          {media.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 z-10"
                aria-label="السابق"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1 z-10"
                aria-label="التالي"
              >
                <ChevronRight className="h-6 w-6" />
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
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground">{product.category || 'غير محدد'}</p>
        <CardTitle className="text-lg font-headline mt-1">{product.name || 'منتج غير محدد'}</CardTitle>
        <p className="text-lg font-semibold mt-2 text-primary">{product.price || 'غير محدد'} ₪</p>
        
                {/* Social Media Icons */}
        <div className="text-center mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
            <p className="text-sm text-gray-700 font-medium">
              💬 للشراء قم بالضغط على وسيلة التواصل المفضلة لديك
            </p>
          </div>
                    <div className="flex justify-center gap-3">
            <button
              onClick={(e) => handleSocialClick(e, '', 'whatsapp')}
              className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              title="واتساب"
            >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </button>
          
                      <button
              onClick={(e) => handleSocialClick(e, '', 'facebook')}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              title="فيسبوك"
            >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          
                      <button
              onClick={(e) => handleSocialClick(e, '', 'instagram')}
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              title="انستغرام"
            >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243 0-.49.144-.928.49-1.243.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243 0 .49-.144.928-.49 1.243-.369.315-.807.49-1.297.49z"/>
            </svg>
          </button>
          
                      <button
              onClick={(e) => handleSocialClick(e, '', 'snapchat')}
              className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
              title="سناب شات"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM17.096 15.936c-.346 0-.49-.175-.49-.49 0-.315.144-.49.49-.49s.49.175.49.49c0 .315-.144.49-.49.49zm-2.026-2.026c-.346 0-.49-.175-.49-.49 0-.315.144-.49.49-.49s.49.175.49.49c0 .315-.144.49-.49.49zm-2.026-2.026c-.346 0-.49-.175-.49-.49 0-.315.144-.49.49-.49s.49.175.49.49c0 .315-.144.49-.49.49zm-2.026-2.026c-.346 0-.49-.175-.49-.49 0-.315.144-.49.49-.49s.49.175.49.49c0 .315-.144.49-.49.49zm-2.026-2.026c-.346 0-.49-.175-.49-.49 0-.315.144-.49.49-.49s.49.175.49.49c0 .315-.144.49-.49.49zm-2.026-2.026c-.346 0-.49-.175-.49-.49 0-.315.144-.49.49-.49s.49.175.49.49c0 .315-.144.49-.49.49z"/>
              </svg>
            </button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full font-bold py-2 rounded-lg transition-transform duration-200 active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground shadow"
          onClick={handleAddToCart}
        >
          أضف للسلة
        </Button>
      </CardFooter>
    </Card>
  );
}
