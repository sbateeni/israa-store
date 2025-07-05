"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Product } from "@/types";
import Image from "next/image";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/cart-provider";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Facebook } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

const SnapchatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M5 11a7 7 0 0 1 14 0v7a1.78 1.78 0 0 1 -3.1 1.4a1.65 1.65 0 0 0 -2.6 0a1.65 1.65 0 0 1 -2.6 0a1.78 1.78 0 0 1 -3.1 -1.4v-7"></path>
       <path d="M10 10l.01 0"></path>
       <path d="M14 10l.01 0"></path>
       <line x1="10" y1="14" x2="14" y2="14"></line>
    </svg>
);

interface ProductModalProps {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}

export default function ProductModal({ product, onOpenChange }: ProductModalProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { formatSocialLink } = useSettings();
  const [quantity, setQuantity] = useState(1);

  // التحقق من صحة المنتج
  if (!product || typeof product !== 'object') {
    return null;
  }

  const handleAddToCart = () => {
    if (!product || !product.name) {
      toast({
        title: "خطأ",
        description: "لا يمكن إضافة منتج غير صحيح",
        variant: "destructive",
      });
      return;
    }
    
    // إضافة المنتج بالكمية المحددة
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    
    toast({
      title: "تم الإضافة",
      description: `تم إضافة ${quantity} من ${product.name} إلى السلة`,
    });
    
    onOpenChange(false);
  };

  const handleSocialClick = (platform: 'whatsapp' | 'facebook' | 'instagram' | 'snapchat') => {
    if (!product) {
      toast({
        title: "خطأ",
        description: "منتج غير صحيح",
        variant: "destructive",
      });
      return;
    }
    
    const settingsLink = formatSocialLink(platform);
    
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
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name || 'Product'}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground rounded-lg">
                لا توجد صورة
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <DialogHeader>
              <p className="text-sm text-muted-foreground">{product.category || 'غير محدد'}</p>
              <DialogTitle className="text-2xl font-headline">{product.name || 'منتج غير محدد'}</DialogTitle>
            </DialogHeader>
            <p className="text-2xl font-bold text-primary my-4">{product.price || 'غير محدد'} ₪</p>
            <DialogDescription className="text-base flex-grow">
              {product.description || 'لا يوجد وصف للمنتج'}
              
              {/* Social Media Icons */}
              <div className="mt-4 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700 font-medium">
                    💬 للشراء قم بالضغط على وسيلة التواصل المفضلة لديك
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleSocialClick('whatsapp')}
                    className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                    title="واتساب"
                  >
                    <WhatsAppIcon />
                  </button>
                  
                  <button
                    onClick={() => handleSocialClick('facebook')}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                    title="فيسبوك"
                  >
                    <Facebook className="h-5 w-5 text-white" />
                  </button>
                  
                  <button
                    onClick={() => handleSocialClick('instagram')}
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                    title="انستغرام"
                  >
                    <Instagram className="h-5 w-5 text-white" />
                  </button>
                  
                  <button
                    onClick={() => handleSocialClick('snapchat')}
                    className="w-12 h-12 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                    title="سناب شات"
                  >
                    <SnapchatIcon />
                  </button>
                </div>
              </div>
            </DialogDescription>

            <DialogFooter className="mt-6">
              <div className="flex items-center gap-4 w-full">
                <div className="flex items-center gap-2">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    الكمية:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAddToCart} className="flex-1">
                  أضف للسلة - {quantity * (product.price || 0)} ₪
                </Button>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}