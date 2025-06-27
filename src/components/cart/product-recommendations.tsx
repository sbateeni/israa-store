"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/contexts/cart-provider";
import { productRecommendations } from "@/ai/flows/product-recommendations";
import { Product } from "@/types";
import { useLocale } from "@/contexts/locale-provider";
import Image from "next/image";
import { Button } from "../ui/button";
import { products as allProducts } from "@/lib/products";
import { Skeleton } from "../ui/skeleton";

export default function ProductRecommendations() {
  const { items: cartItems, addItem } = useCart();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    async function fetchRecommendations() {
      if (cartItems.length > 0) {
        setIsLoading(true);
        try {
          const aiInput = cartItems.map(item => ({
            name: item.name,
            category: item.category,
            description: item.description,
          }));

          const result = await productRecommendations({ cartItems: aiInput });
          
          // The AI returns product details, we need to find full product info from our db
          const matchedProducts = result.map(rec => 
            allProducts.find(p => p.name.toLowerCase() === rec.name.toLowerCase())
          ).filter((p): p is Product => p !== undefined);

          setRecommendations(matchedProducts.slice(0, 2)); // Show max 2 recommendations
        } catch (error) {
          console.error("Failed to fetch recommendations:", error);
          setRecommendations([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setRecommendations([]);
      }
    }

    fetchRecommendations();
  }, [cartItems]);

  if (isLoading) {
    return (
      <div>
        <h4 className="font-semibold mb-2">{t("cart.recommendations")}</h4>
        <div className="space-y-2">
            <div className="flex gap-2 items-center">
                <Skeleton className="w-12 h-12 rounded"/>
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24"/>
                    <Skeleton className="h-3 w-16"/>
                </div>
            </div>
            <div className="flex gap-2 items-center">
                <Skeleton className="w-12 h-12 rounded"/>
                <div className="space-y-1">
                    <Skeleton className="h-4 w-28"/>
                    <Skeleton className="h-3 w-20"/>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="font-semibold mb-2">{t("cart.recommendations")}</h4>
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
                <Image
                src={rec.image}
                alt={rec.name}
                width={48}
                height={48}
                className="rounded-md object-cover"
                data-ai-hint={rec.dataAiHint}
                />
                <div>
                <p className="text-sm font-medium">{rec.name}</p>
                <p className="text-xs text-muted-foreground">{rec.price} ₪</p>
                </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => addItem(rec)}>Add</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
