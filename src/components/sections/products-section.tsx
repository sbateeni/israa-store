"use client";

import { fetchProducts } from "@/lib/products";
import { useLocale } from "@/contexts/locale-provider";
import { useSettings } from "@/hooks/use-settings";
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
  const { socialLinks, loading: settingsLoading } = useSettings();

  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug logging for settings
  console.log('ProductsSection - socialLinks:', socialLinks);
  console.log('ProductsSection - settingsLoading:', settingsLoading);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const prods = await fetchProducts();
        console.log('products:', prods);
        
        // التحقق من صحة البيانات
        if (Array.isArray(prods)) {
          // تنظيف البيانات للتأكد من عدم وجود قيم null
          const validProducts = prods.filter(product => 
            product && 
            typeof product === 'object' && 
            product.name && 
            product.price
          );
          console.log('valid products:', validProducts);
          setProducts(validProducts);
        } else {
          console.log('Invalid products data:', prods);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter((cat): cat is ProductCategory => Boolean(cat)))),
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

      {loading ? (
        <div className="text-center py-8">جاري تحميل المنتجات...</div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
        <ProductCard 
                key={`product-${index}`} 
            product={product} 
            onViewDetails={() => handleProductClick(product)}
            />
        ))}
      </div>
      )}
      <ProductModal product={selectedProduct} onOpenChange={(isOpen) => !isOpen && setSelectedProduct(null)}/>
    </section>
  );
}
