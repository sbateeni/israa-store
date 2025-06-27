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
import { Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";
import ProductRecommendations from "./product-recommendations";

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
                <Button className="w-full" disabled={items.length === 0}>Checkout</Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
