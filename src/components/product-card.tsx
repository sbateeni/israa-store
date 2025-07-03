"use client";

import Image from "next/image";
import type { Product } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/cart-provider";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  onViewDetails: () => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { addItem, setCartOpen } = useCart();
  const { toast } = useToast();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    toast({
      title: `${product.name} added to cart!`,
    });
    setCartOpen(true);
  };

  return (
    <Card
      className="overflow-hidden group cursor-pointer flex flex-col h-full rounded-2xl shadow-md transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 bg-background"
      onClick={onViewDetails}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
          {product.image ? (
            <Image
              src={product.image as string}
              alt={product.name}
              data-ai-hint={product.dataAiHint}
              fill
              className="object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-110 group-hover:brightness-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
              لا توجد صورة
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <CardTitle className="text-lg font-headline mt-1">{product.name}</CardTitle>
        <p className="text-lg font-semibold mt-2 text-primary">{product.price} ₪</p>
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
