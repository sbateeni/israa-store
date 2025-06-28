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
import { Instagram, Twitter, Facebook } from "lucide-react";

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
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square">
              {product.video ? (
                <video
                  src={product.video}
                  controls
                  loop
                  autoPlay
                  muted
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                  data-ai-hint={product.dataAiHint}
                />
              )}
            </div>
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
            <DialogFooter className="mt-4 sm:justify-between items-center">
                <div className="flex justify-start items-center gap-2 order-last sm:order-first">
                    {product.instagram && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </Button>
                    )}
                    {product.twitter && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </Button>
                    )}
                    {product.facebook && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <Facebook className="h-5 w-5" />
                            </a>
                        </Button>
                    )}
                </div>
              <Button className="w-full sm:w-auto" onClick={handleAddToCart}>Add to Cart</Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
