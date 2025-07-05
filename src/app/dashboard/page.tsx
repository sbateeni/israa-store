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
      const newProduct: Product = {
        id: editingProduct ? editingProduct.id : Date.now().toString(),
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        image: imageUrl,
        video: videoUrl,
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
      setForm({ name: "", description: "", price: "", image: undefined, video: undefined });
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
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: undefined,
      video: undefined,
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
        <div className={`mb-4 p-2 rounded text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
            className="border rounded w-full p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">وصف المنتج</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            className="border rounded w-full p-2"
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
            className="border rounded w-full p-2"
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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editingProduct ? "تعديل المنتج" : "إضافة منتج"}
        </button>
        {editingProduct && (
          <button
            type="button"
            className="ml-2 text-red-600"
            onClick={() => {
              setEditingProduct(null);
              setForm({ name: "", description: "", price: "", image: undefined, video: undefined });
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
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => handleEdit(product)}
                >
                  تعديل
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
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