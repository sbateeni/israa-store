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
    // لا نضيف روابط افتراضية، بل نتركها فارغة لاستخدام الإعدادات العامة
    facebook: undefined,
    instagram: undefined,
    snapchat: undefined,
    whatsapp: undefined,
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
const SETTINGS_BLOB_KEY = "site-settings.json";
const MEDIA_PREFIX = "products-media/";

// جلب المنتجات من Blob
const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
export async function fetchProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) return [];
  const data = await res.json();
  // تنظيف روابط التواصل الاجتماعي للمنتجات لاستخدام الإعدادات العامة
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

// جلب إعدادات الموقع من الخادم
export async function fetchSiteSettings() {
  const maxRetries = 3;
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries} to fetch settings...`);
      
      // إضافة timestamp لمنع التخزين المؤقت
      const res = await fetch("/api/settings?" + new Date().getTime());
      
      if (!res.ok) {
        console.log(`Fetch attempt ${attempt} failed with status:`, res.status);
        if (attempt === maxRetries) {
          return getDefaultSettings();
        }
        continue;
      }
      
      const data = await res.json();
      console.log('Fetched site settings:', data);
      
      if (data && (data.whatsapp || data.facebook || data.instagram || data.snapchat || data.dashboardPassword)) {
        console.log(`✅ Settings fetched successfully on attempt ${attempt}`);
        return data;
      } else {
        console.log(`Attempt ${attempt}: Settings appear to be empty, retrying...`);
        if (attempt === maxRetries) {
          return getDefaultSettings();
        }
      }
      
    } catch (error) {
      console.error(`Error fetching site settings (attempt ${attempt}):`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`Retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error('All attempts to fetch settings failed');
  return getDefaultSettings();
}

// حفظ إعدادات الموقع على الخادم
export async function saveSiteSettings(settings: any) {
  console.log('Saving site settings:', settings);
  
  const maxRetries = 3;
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries} to save settings...`);
      
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      console.log('Settings save response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Settings save failed:', errorText);
        throw new Error("فشل حفظ إعدادات الموقع: " + errorText);
      }
      
      const data = await res.json();
      console.log('Settings save successful:', data);
      
      // التحقق من أن الحفظ تم بنجاح
      if (!data.success) {
        throw new Error("فشل حفظ الإعدادات: " + (data.error || 'خطأ غير معروف'));
      }
      
      console.log(`✅ Settings saved successfully on attempt ${attempt}`);
      return !!data.success;
      
    } catch (error) {
      console.error(`Error in saveSiteSettings (attempt ${attempt}):`, error);
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`Retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.error('All attempts to save settings failed');
  throw lastError;
}

// الإعدادات الافتراضية
function getDefaultSettings() {
  return {
    whatsapp: "",
    facebook: "",
    instagram: "",
    snapchat: "",
    dashboardPassword: "", // كلمة المرور محفوظة على الخادم فقط
  };
}

// التحقق من كلمة المرور
export async function verifyPassword(password: string) {
  try {
    const settings = await fetchSiteSettings();
    // إذا لم تكن كلمة المرور محفوظة على الخادم، استخدم كلمة المرور الافتراضية
    if (!settings.dashboardPassword) {
      return password === "israa2024";
    }
    return password === settings.dashboardPassword;
  } catch (error) {
    console.error('Error verifying password:', error);
    // في حالة الخطأ، استخدام كلمة المرور الافتراضية
    return password === "israa2024";
  }
}
