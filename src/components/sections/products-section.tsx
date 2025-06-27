"use client";

import { products as fallbackProducts } from "@/lib/products";
import { useLocale } from "@/contexts/locale-provider";
import React, { useState, useMemo, useEffect } from "react";
import ProductCard from "../product-card";
import { ProductCategory, Product } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductModal from "../product-modal";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";

export default function ProductsSection() {
  const { t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        if (querySnapshot.empty) {
            setProducts(fallbackProducts); // Use fallback if firestore is empty
        } else {
            const productsData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Product[];
            setProducts(productsData);
        }
      } catch (error) {
        console.error("Error fetching products: ", error);
        setProducts(fallbackProducts); // Use fallback on error
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") {
      return products;
    }
    return products.filter((p) => p.category === selectedCategory);
  }, [selectedCategory, products]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <section id="products">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl font-headline font-bold">{t("products.title")}</h2>
        <Select
          onValueChange={(value: ProductCategory | "all") =>
            setSelectedCategory(value)
          }
          defaultValue="all"
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.all')}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
             Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
             ))
        ) : (
            filteredProducts.map((product) => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={() => handleProductClick(product)}
                />
            ))
        )}
      </div>
      <ProductModal product={selectedProduct} onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}/>
    </section>
  );
}
