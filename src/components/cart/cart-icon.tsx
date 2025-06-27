"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-provider";
import { ShoppingCart } from "lucide-react";
import CartSheet from "./cart-sheet";

export default function CartIcon() {
  const { totalItems, setCartOpen, isCartOpen } = useCart();
  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setCartOpen(true)}>
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {totalItems}
          </span>
        )}
      </Button>
      <CartSheet isOpen={isCartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
