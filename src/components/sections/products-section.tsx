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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function ProductsSection() {
  const { t } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory | "all">("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      let allFetchedProducts: Product[] = [];

      // 1. Load from localStorage
      try {
        const localProductsJSON = localStorage.getItem('safaa-products');
        if (localProductsJSON) {
          allFetchedProducts.push(...JSON.parse(localProductsJSON));
        }
      } catch (e) {
        console.warn("Could not parse local products", e);
      }

      // 2. Fetch from Firestore and fallback
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        if (querySnapshot.empty) {
            allFetchedProducts.push(...fallbackProducts); // Use fallback if firestore is empty
        } else {
            const firestoreProducts = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Product[];
            allFetchedProducts.push(...firestoreProducts);
        }
      } catch (err: any) {
        console.error("Error fetching products: ", err);
        if (err.code === 'permission-denied') {
          setError("Products could not be loaded from database due to a permission issue. Showing sample/local products instead.");
        } else {
          setError("An error occurred while loading products from database. Showing sample/local products instead.");
        }
        allFetchedProducts.push(...fallbackProducts); // Use fallback on error
      } finally {
        // De-duplicate, giving preference to products that came first (local, then firestore)
        const uniqueProducts = Array.from(new Map(allFetchedProducts.map(p => [p.name, p])).values());
        setProducts(uniqueProducts);
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

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
