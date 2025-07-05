"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/cart-provider";
import { useLocale } from "@/contexts/locale-provider";
import { Button } from "../ui/button";
import Image from "next/image";
import { Input } from "../ui/input";
import { Trash2, Instagram } from "lucide-react";
import { Separator } from "../ui/separator";
import ProductRecommendations from "./product-recommendations";
import { useSettings } from "@/hooks/use-settings";

const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);

const SnapchatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
       <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
       <path d="M5 11a7 7 0 0 1 14 0v7a1.78 1.78 0 0 1 -3.1 1.4a1.65 1.65 0 0 0 -2.6 0a1.65 1.65 0 0 1 -2.6 0a1.78 1.78 0 0 1 -3.1 -1.4v-7"></path>
       <path d="M10 10l.01 0"></path>
       <path d="M14 10l.01 0"></path>
       <line x1="10" y1="14" x2="14" y2="14"></line>
    </svg>
);

interface CartSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const { t } = useLocale();
  const { formatSocialLink } = useSettings();

  const handleSocialClick = (platform: 'whatsapp' | 'instagram' | 'snapchat') => {
    const settingsLink = formatSocialLink(platform);
    
    if (settingsLink) {
      window.open(settingsLink, '_blank');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('cart.title')}</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">{t('cart.empty')}</p>
                <Button onClick={() => onOpenChange(false)}>
                  {t('cart.continue_shopping')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 border-b">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.image || ''}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.price} ₪</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-8"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
            <>
            <Separator />
            <ProductRecommendations />
            </>
        )}
        <SheetFooter>
            <div className="w-full space-y-4">
                <div className="flex justify-between font-bold text-lg">
                    <span>{t('cart.total')}</span>
                    <span>{totalPrice} ₪</span>
                </div>
                {items.length > 0 ? (
                  <div className="w-full space-y-3 pt-2 text-center">
                      <p className="text-sm text-muted-foreground">{t('cart.order_via')}</p>
                      <div className="flex justify-center gap-4">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-12 h-12 rounded-full"
                            onClick={() => handleSocialClick('whatsapp')}
                          >
                              <WhatsAppIcon />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-12 h-12 rounded-full"
                            onClick={() => handleSocialClick('instagram')}
                          >
                              <Instagram className="h-6 w-6" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="w-12 h-12 rounded-full"
                            onClick={() => handleSocialClick('snapchat')}
                          >
                              <SnapchatIcon />
                          </Button>
                      </div>
                  </div>
                ) : (
                  <Button className="w-full" disabled>{t('cart.checkout')}</Button>
                )}
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
