"use client";

import { products as staticProducts } from "@/lib/products";
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

export default function ProductsSection() {
  const { t } = useLocale();

  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
        setLoading(false);
      })
      .catch(() => {
        setProducts(staticProducts); // fallback
        setError("تعذر تحميل المنتجات");
        setLoading(false);
      });
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter((cat): cat is ProductCategory => typeof cat === 'string'))),
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
          <p>جاري تحميل المنتجات...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p>لا توجد منتجات.</p>
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
