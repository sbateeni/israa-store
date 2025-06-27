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
    <Card className="overflow-hidden group cursor-pointer flex flex-col h-full" onClick={onViewDetails}>
      <CardHeader className="p-0">
        <div className="relative aspect-square w-full">
          <Image
            src={product.image}
            alt={product.name}
            data-ai-hint={product.dataAiHint}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <CardTitle className="text-lg font-headline mt-1">{product.name}</CardTitle>
        <p className="text-lg font-semibold mt-2 text-primary">{product.price} ₪</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
