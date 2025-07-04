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
import { useState, useEffect } from "react";

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
  const [imgIdx, setImgIdx] = useState(0);
  const [globalSocials, setGlobalSocials] = useState<{facebook?: string, instagram?: string, snapchat?: string, whatsapp?: string}>({});

  useEffect(() => {
    fetch('/api/socials')
      .then(async res => {
        try {
          const data = await res.json();
          if (data && typeof data === 'object') setGlobalSocials(data);
        } catch {
          setGlobalSocials({});
        }
      });
  }, []);

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: `تمت إضافة المنتج إلى السلة بنجاح!`,
      description: `تمت إضافة ${product.name} إلى سلة مشترياتك.`,
    });
    onOpenChange(false);
    setCartOpen(true);
  }

  const images = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];
  const safeImages = images.filter((img): img is string => typeof img === 'string');

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square">
              {safeImages.length > 0 ? (
                safeImages[imgIdx].endsWith('.mp4') ? (
                  <video
                    src={safeImages[imgIdx]}
                    controls
                    muted
                    className="w-full h-full object-cover rounded-md"
                    style={{ aspectRatio: "1/1" }}
                  />
                ) : (
                  <Image
                    src={safeImages[imgIdx]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover rounded-md"
                    data-ai-hint={product.dataAiHint}
                  />
                )
              ) : null}
            </div>
            {safeImages.length > 1 && (
              <div className="flex gap-2 mt-2 justify-center">
                {safeImages.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    className={`border rounded-md overflow-hidden w-14 h-14 relative ${imgIdx === idx ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setImgIdx(idx)}
                  >
                    {img.endsWith('.mp4') ? (
                      <video src={img} className="object-cover w-full h-full" muted />
                    ) : (
                      <Image src={img} alt={product.name + ' thumbnail'} fill className="object-cover" sizes="56px" />
                    )}
                  </button>
                ))}
              </div>
            )}
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
                    {(product.facebook || globalSocials.facebook) && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.facebook || globalSocials.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <Facebook className="h-5 w-5" />
                            </a>
                        </Button>
                    )}
                    {(product.instagram || globalSocials.instagram) && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.instagram || globalSocials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </Button>
                    )}
                    {(product.snapchat || globalSocials.snapchat) && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.snapchat || globalSocials.snapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat">
                                <SnapchatIcon />
                            </a>
                        </Button>
                    )}
                    {(product.whatsapp || globalSocials.whatsapp) && (
                        <Button variant="ghost" size="icon" asChild>
                            <a href={product.whatsapp || globalSocials.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
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