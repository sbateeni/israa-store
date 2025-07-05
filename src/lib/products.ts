import type { Product } from "@/types";
import { v4 as uuidv4 } from "uuid";

// Note: This file now serves as a fallback or for initial data.
// All active product management is now handled through the dashboard and Firebase.

type Testimonial = {
  quote: string;
  author: string;
};

function withDefaultSocials(product: Omit<Product, 'facebook' | 'instagram' | 'snapchat' | 'whatsapp'> & Partial<Pick<Product, 'facebook' | 'instagram' | 'snapchat' | 'whatsapp'>>): Product {
  return {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    snapchat: "https://www.snapchat.com/",
    whatsapp: "https://wa.me/966500000000", // رقم افتراضي للمثال
    ...product,
  };
}

export const products: Product[] = [
];

export const testimonials: Testimonial[] = [
    {
        quote: "Wonderful products and excellent service!",
        author: "Sarah",
    },
    {
        quote: "The best store for perfumes and clothing, I recommend everyone to try it.",
        author: "Ahmed",
    },
    {
        quote: "Fast delivery and high quality. I am very satisfied.",
        author: "Layla",
    },
];

export const heroSlides = [
    {
        image: "https://placehold.co/1200x600.png",
        alt: "Luxury perfume collection",
        dataAiHint: "luxury perfume"
    },
    {
        image: "https://placehold.co/1200x600.png",
        alt: "Elegant modern apparel",
        dataAiHint: "fashion model"
    },
    {
        image: "https://placehold.co/1200x600.png",
        alt: "Perfume and apparel together",
        dataAiHint: "stylish outfit"
    },
]

const PRODUCTS_BLOB_KEY = "products.json";
const MEDIA_PREFIX = "products-media/";

// جلب المنتجات من Blob
const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_3rYI5trXqmi2Rgmd_40mfx02cgDWi0OdNFlLEf8fa1ZTQXi";
export async function fetchProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) return [];
  const data = await res.json();
  // إضافة روابط التواصل الاجتماعي الافتراضية للمنتجات
  return (data || []).map((product: any) => withDefaultSocials(product));
}

// رفع أو تحديث ملف المنتجات عبر API route
export async function saveProducts(products: any[]) {
  console.log('Saving products:', products);
  const blob = new Blob([JSON.stringify(products)], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", blob, PRODUCTS_BLOB_KEY);
  formData.append("key", PRODUCTS_BLOB_KEY);
  console.log('Uploading to /api/upload...');
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  console.log('Upload response status:', res.status);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Upload failed:', errorText);
    throw new Error("فشل رفع ملف المنتجات: " + errorText);
  }
  const data = await res.json();
  console.log('Upload successful:', data);
  return !!data.url;
}

// رفع صورة أو فيديو عبر API route
export async function uploadMedia(file: File) {
  const key = MEDIA_PREFIX + uuidv4() + "_" + file.name;
  const formData = new FormData();
  formData.append("file", file, key);
  formData.append("key", key);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("فشل رفع الملف: " + errorText);
  }
  const data = await res.json();
  return data.url;
}

// حذف منتج من القائمة وحفظها
export async function deleteProduct(productId: number) {
  const products = await fetchProducts();
  const newProducts = products.filter((p: any) => p.id !== productId);
  await saveProducts(newProducts);
  return newProducts;
}
