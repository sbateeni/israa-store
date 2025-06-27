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

interface ProductModalProps {
  product: Product | null;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ProductModal({ product, onOpenChange }: ProductModalProps) {
  const { addItem, setCartOpen } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: `${product.name} added to cart!`,
    });
    onOpenChange(false);
    setCartOpen(true);
  }

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover rounded-md"
              data-ai-hint={product.dataAiHint}
            />
          </div>
          <div className="flex flex-col">
            <DialogHeader>
              <p className="text-sm text-muted-foreground">{product.category}</p>
              <DialogTitle className="text-2xl font-headline">{product.name}</DialogTitle>
            </DialogHeader>
            <p className="text-2xl font-bold text-primary my-4">{product.price} ₪</p>
            <DialogDescription className="text-base flex-grow">
              {product.description}
            </DialogDescription>
            <DialogFooter className="mt-4">
              <Button className="w-full" onClick={handleAddToCart}>Add to Cart</Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
