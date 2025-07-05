"use client";
import React, { useState, useEffect, useRef } from "react";
import { fetchProducts, saveProducts, uploadMedia, deleteProduct } from "@/lib/products";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  video?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  snapchat?: string;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: undefined as File | undefined,
    video: undefined as File | undefined,
    whatsapp: "",
    facebook: "",
    instagram: "",
    snapchat: "",
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("israa_dashboard_auth");
      if (auth !== "1") {
        router.replace("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const prods = await fetchProducts();
      setProducts(prods);
      setLoading(false);
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = editingProduct?.image;
      let videoUrl = editingProduct?.video;
      if (form.image) {
        imageUrl = await uploadMedia(form.image);
      }
      if (form.video) {
        videoUrl = await uploadMedia(form.video);
      }
      
      // تنسيق رابط واتساب
      let whatsappUrl = form.whatsapp;
      if (whatsappUrl && !whatsappUrl.startsWith('https://wa.me/')) {
        // إذا كان المستخدم كتب رقم فقط، أضف الرابط الكامل
        if (whatsappUrl.match(/^\d+$/)) {
          whatsappUrl = `https://wa.me/${whatsappUrl}`;
        }
      }
      
      const newProduct: Product = {
        id: editingProduct ? editingProduct.id : Date.now(),
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        image: imageUrl,
        video: videoUrl,
        whatsapp: whatsappUrl || undefined,
        facebook: form.facebook || undefined,
        instagram: form.instagram || undefined,
        snapchat: form.snapchat || undefined,
      };
      let newProducts;
      if (editingProduct) {
        newProducts = products.map((p) => (p.id === editingProduct.id ? newProduct : p));
      } else {
        newProducts = [...products, newProduct];
      }
      await saveProducts(newProducts);
      setProducts(newProducts);
      setEditingProduct(null);
      setForm({ 
        name: "", 
        description: "", 
        price: "", 
        image: undefined, 
        video: undefined,
        whatsapp: "",
        facebook: "",
        instagram: "",
        snapchat: "",
      });
      if (imageInputRef.current) imageInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      setMessage({ type: 'success', text: editingProduct ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء حفظ المنتج' });
    }
    setTimeout(() => setMessage(null), 4000);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // استخراج الرقم من رابط واتساب للعرض
    let whatsappDisplay = product.whatsapp || "";
    if (whatsappDisplay.startsWith('https://wa.me/')) {
      whatsappDisplay = whatsappDisplay.replace('https://wa.me/', '');
    }
    
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: undefined,
      video: undefined,
      whatsapp: whatsappDisplay,
      facebook: product.facebook || "",
      instagram: product.instagram || "",
      snapchat: product.snapchat || "",
    });
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      const newProducts = await deleteProduct(id);
      setProducts(newProducts);
      setMessage({ type: 'success', text: 'تم حذف المنتج بنجاح' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'حدث خطأ أثناء حذف المنتج' });
    }
    setLoading(false);
    if (editingProduct?.id === id) setEditingProduct(null);
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {message && (
        <div className={`mb-4 p-4 rounded-lg text-center font-medium shadow-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">لوحة تحكم المنتجات</h1>
      <button
        className="mb-4 text-sm text-blue-600 underline"
        onClick={() => {
          localStorage.removeItem("israa_dashboard_auth");
          router.push("/login");
        }}
      >
        تسجيل الخروج
      </button>
      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded mb-8">
        <div>
          <label className="block mb-1">اسم المنتج</label>
          <input
            name="name"
            value={form.name}
            onChange={handleInputChange}
            className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block mb-1">وصف المنتج</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block mb-1">السعر</label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleInputChange}
            className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label className="block mb-1">صورة المنتج</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={imageInputRef}
          />
        </div>
        <div>
          <label className="block mb-1">فيديو المنتج</label>
          <input
            name="video"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            ref={videoInputRef}
          />
        </div>
        
        {/* Social Media Links */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">روابط التواصل الاجتماعي</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-green-600">رابط واتساب</label>
              <input
                name="whatsapp"
                type="url"
                value={form.whatsapp}
                onChange={handleInputChange}
                className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://wa.me/966500000000"
              />
              <p className="text-xs text-gray-500 mt-1">اكتب الرقم فقط بدون + (مثال: 966500000000)</p>
            </div>
            <div>
              <label className="block mb-1 text-blue-600">رابط فيسبوك</label>
              <input
                name="facebook"
                type="url"
                value={form.facebook}
                onChange={handleInputChange}
                className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <label className="block mb-1 text-purple-600">رابط انستغرام</label>
              <input
                name="instagram"
                type="url"
                value={form.instagram}
                onChange={handleInputChange}
                className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className="block mb-1 text-yellow-600">رابط سناب شات</label>
              <input
                name="snapchat"
                type="url"
                value={form.snapchat}
                onChange={handleInputChange}
                className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://snapchat.com/add/username"
              />
            </div>
          </div>
        </div>
        
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg">
          {editingProduct ? "تعديل المنتج" : "إضافة منتج"}
        </button>
        {editingProduct && (
          <button
            type="button"
            className="ml-2 text-red-600"
            onClick={() => {
              setEditingProduct(null);
              setForm({ 
                name: "", 
                description: "", 
                price: "", 
                image: undefined, 
                video: undefined,
                whatsapp: "",
                facebook: "",
                instagram: "",
                snapchat: "",
              });
              if (imageInputRef.current) imageInputRef.current.value = "";
              if (videoInputRef.current) videoInputRef.current.value = "";
            }}
          >
            إلغاء التعديل
          </button>
        )}
      </form>
      <div>
        <h2 className="text-xl font-semibold mb-2">قائمة المنتجات</h2>
        {loading ? <p>جاري التحميل...</p> : products.length === 0 && <p>لا يوجد منتجات بعد.</p>}
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="border p-4 rounded flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-bold">{product.name}</h3>
                <p>{product.description}</p>
                <p className="text-sm text-gray-600">السعر: {product.price} ريال</p>
                {product.image && (
                  <img src={product.image} alt={product.name} className="w-32 h-32 object-cover mt-2" />
                )}
                {product.video && (
                  <video src={product.video} controls className="w-32 h-32 mt-2" />
                )}
                {/* Social Media Links Display */}
                <div className="flex gap-2 mt-2">
                  {product.whatsapp && (
                    <a href={product.whatsapp} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                      واتساب
                    </a>
                  )}
                  {product.facebook && (
                    <a href={product.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      فيسبوك
                    </a>
                  )}
                  {product.instagram && (
                    <a href={product.instagram} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                      انستغرام
                    </a>
                  )}
                  {product.snapchat && (
                    <a href={product.snapchat} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-800">
                      سناب شات
                    </a>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md"
                  onClick={() => handleEdit(product)}
                >
                  تعديل
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md"
                  onClick={() => handleDelete(product.id)}
                >
                  حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 