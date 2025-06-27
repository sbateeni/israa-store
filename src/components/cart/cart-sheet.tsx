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
  onOpenChange: (isOpen: boolean) => void;
}

export default function CartSheet({ isOpen, onOpenChange }: CartSheetProps) {
  const { t, locale } = useLocale();
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{t("cart.title")} ({totalItems})</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground">{t("cart.empty")}</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto pr-4 -mr-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                    data-ai-hint={item.dataAiHint}
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.price} ₪</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        className="w-16 h-8"
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
                          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" asChild>
                              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" aria-label="Order on WhatsApp">
                                  <WhatsAppIcon />
                              </a>
                          </Button>
                          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" asChild>
                              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Order on Instagram">
                                  <Instagram className="h-6 w-6" />
                              </a>
                          </Button>
                          <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" asChild>
                              <a href="https://www.snapchat.com/" target="_blank" rel="noopener noreferrer" aria-label="Order on Snapchat">
                                  <SnapchatIcon />
                              </a>
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
