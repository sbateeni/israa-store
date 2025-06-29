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
                    {product.facebook && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <Facebook className="h-5 w-5" />
                            </a>
                        </Button>
                    )}
                    {product.instagram && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </Button>
                    )}
                    {product.snapchat && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.snapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
                                <SnapchatIcon />
                            </a>
                        </Button>
                    )}
                    {product.whatsapp && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                <WhatsAppIcon />
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
