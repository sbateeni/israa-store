"use client";
import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "israa2024"; // يمكنك تغيير كلمة المرور لاحقاً

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // المنتجات
  const [products, setProducts] = useState<any[]>([]);
  const [productForm, setProductForm] = useState<any>({ name: "", description: "", price: "", category: "", id: "", image: "", images: [] });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);

  // --- روابط التواصل الاجتماعي العامة ---
  const [socials, setSocials] = useState({ facebook: "", instagram: "", snapchat: "", whatsapp: "" });
  const [socialsLoading, setSocialsLoading] = useState(false);
  const [socialsMsg, setSocialsMsg] = useState("");

  // جلب الملفات
  useEffect(() => {
    if (authed) {
      fetch("/api/files")
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setFiles(data) : setFiles([]))
        .catch(() => setFiles([]));
      fetch("/api/products")
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setProducts(data) : setProducts([]))
        .catch(() => setProducts([]));
    }
  }, [loading, authed]);

  // جلب الروابط عند الدخول
  useEffect(() => {
    if (authed) {
      setSocialsLoading(true);
      fetch("/api/socials")
        .then(res => res.json())
        .then(data => setSocials(data))
        .catch(() => setSocials({ facebook: "", instagram: "", snapchat: "", whatsapp: "" }))
        .finally(() => setSocialsLoading(false));
    }
  }, [authed]);

  // رفع ملف
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok && data.url) {
      setFile(null);
      setLoading(false);
      // تحديث قائمة الملفات مباشرة بعد الرفع
      fetch("/api/files")
        .then(res => res.json())
        .then(data => Array.isArray(data) ? setFiles(data) : setFiles([]));
      // إشعار المستخدم بالنجاح
      setError("تم رفع الملف بنجاح");
      setTimeout(() => setError(""), 2000);
    } else {
      setError(data?.error || "فشل رفع الملف");
      setLoading(false);
    }
  };

  // حذف ملف
  const handleDelete = async (pathname: string) => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/delete-file", { method: "DELETE", body: JSON.stringify({ pathname }), headers: { "Content-Type": "application/json" } });
    if (res.ok) {
      setTimeout(() => setLoading(false), 500);
    } else {
      setError("فشل حذف الملف");
      setLoading(false);
    }
  };

  // حذف منتج
  const handleDeleteProduct = async (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    await updateProducts(newProducts);
  };

  // تعديل منتج
  const handleEditProduct = (index: number) => {
    setProductForm(products[index]);
    setEditingIndex(index);
  };

  // حفظ منتج (جديد أو تعديل)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let imageUrl = productForm.image;
    // إذا تم اختيار ملف صورة جديد، ارفعه أولاً
    if (productFile) {
      const formData = new FormData();
      formData.append("file", productFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        imageUrl = data.url;
      } else {
        setError(data?.error || "فشل رفع الصورة");
        setLoading(false);
        return;
      }
    }
    let newProducts = [...products];
    if (editingIndex !== null) {
      newProducts[editingIndex] = { ...productForm, image: imageUrl };
    } else {
      newProducts.push({ ...productForm, id: Date.now().toString(), image: imageUrl });
    }
    await updateProducts(newProducts);
    setProductForm({ name: "", description: "", price: "", category: "", id: "", image: "", images: [] });
    setProductFile(null);
    setEditingIndex(null);
    setLoading(false);
  };

  // تحديث المنتجات في Blob Store
  const updateProducts = async (newProducts: any[]) => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/products/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProducts)
    });
    if (res.ok) {
      setProducts(newProducts);
      setLoading(false);
    } else {
      setError("فشل تحديث المنتجات");
      setLoading(false);
    }
  };

  // حفظ الروابط
  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialsLoading(true);
    setSocialsMsg("");
    // توليد رابط واتساب من الرقم فقط
    const socialsToSave = { ...socials, whatsapp: socials.whatsapp ? `https://wa.me/${socials.whatsapp.replace(/[^0-9]/g, "")}` : "" };
    const res = await fetch("/api/socials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(socialsToSave)
    });
    if (res.ok) {
      setSocialsMsg("تم حفظ الروابط بنجاح");
    } else {
      setSocialsMsg("فشل حفظ الروابط");
    }
    setSocialsLoading(false);
    setTimeout(() => setSocialsMsg("") , 2000);
  };

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="mb-4 text-xl font-bold">لوحة تحكم الإدارة</h2>
        <form onSubmit={e => { e.preventDefault(); if (password === ADMIN_PASSWORD) setAuthed(true); else setError("كلمة المرور غير صحيحة"); }}>
          <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} className="border px-3 py-2 rounded mb-2" />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded">دخول</button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* حذف لوحة رفع الملفات المنفصلة */}
      {/* <h2 className="text-2xl font-bold mb-6">لوحة تحكم الملفات</h2>
      <form onSubmit={handleUpload} className="mb-6 flex gap-4 items-center">
        <input type="file" value="" onChange={e => setFile(e.target.files?.[0] || null)} className="border px-3 py-2 rounded" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>رفع</button>
      </form> */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {files.length === 0 && <p>لا توجد ملفات.</p>}
        {files.map((f: any) => (
          <div key={f.pathname} className="border rounded p-4 flex flex-col gap-2">
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{f.pathname}</a>
            <span className="text-xs text-gray-500">الحجم: {Math.round(f.size/1024)} KB</span>
            <span className="text-xs text-gray-500">تاريخ الرفع: {new Date(f.uploadedAt).toLocaleString()}</span>
            <button onClick={() => handleDelete(f.pathname)} className="bg-red-500 text-white px-3 py-1 rounded mt-2" disabled={loading}>حذف</button>
          </div>
        ))}
      </div> */}

      <h2 className="text-2xl font-bold mb-6">إدارة المنتجات</h2>
      <form onSubmit={handleSaveProduct} className="mb-6 flex flex-wrap gap-4 items-center">
        <input type="text" placeholder="اسم المنتج" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="border px-3 py-2 rounded" required />
        <input type="text" placeholder="الوصف" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="border px-3 py-2 rounded" required />
        <input type="text" placeholder="السعر" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="border px-3 py-2 rounded" required />
        <input type="text" placeholder="التصنيف" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="border px-3 py-2 rounded" required />
        {/* حقل اختيار صورة المنتج */}
        <input type="file" accept="image/*,video/*" onChange={e => setProductFile(e.target.files?.[0] || null)} className="border px-3 py-2 rounded" />
        {/* عرض اسم الملف المختار */}
        {productFile && <span className="text-xs text-gray-500">{productFile.name}</span>}
        {/* حقل روابط صور إضافية (اختياري) */}
        <input type="text" placeholder="روابط صور إضافية (مفصولة بفاصلة)" value={productForm.images?.join(",") || ""} onChange={e => setProductForm({ ...productForm, images: e.target.value.split(",") })} className="border px-3 py-2 rounded" />
        {/* حقول روابط التواصل الاجتماعي */}
        <input type="text" placeholder="رابط فيسبوك (اختياري)" value={productForm.facebook || ""} onChange={e => setProductForm({ ...productForm, facebook: e.target.value })} className="border px-3 py-2 rounded" />
        <input type="text" placeholder="رابط إنستجرام (اختياري)" value={productForm.instagram || ""} onChange={e => setProductForm({ ...productForm, instagram: e.target.value })} className="border px-3 py-2 rounded" />
        <input type="text" placeholder="رابط سناب شات (اختياري)" value={productForm.snapchat || ""} onChange={e => setProductForm({ ...productForm, snapchat: e.target.value })} className="border px-3 py-2 rounded" />
        <input type="text" placeholder="رابط واتساب (اختياري)" value={productForm.whatsapp || ""} onChange={e => setProductForm({ ...productForm, whatsapp: e.target.value })} className="border px-3 py-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{editingIndex !== null ? "تعديل المنتج" : "إضافة منتج"}</button>
        {editingIndex !== null && <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => { setProductForm({ name: "", description: "", price: "", category: "", id: "", image: "", images: [] }); setProductFile(null); setEditingIndex(null); }}>إلغاء</button>}
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.length === 0 && <p>لا توجد منتجات.</p>}
        {products.map((p, i) => (
          <div key={p.id || i} className="border rounded p-4 flex flex-col gap-2">
            <span className="font-bold">{p.name}</span>
            <span>{p.description}</span>
            <span>السعر: {p.price}</span>
            <span>التصنيف: {p.category}</span>
            <span className="break-all text-xs">الصورة الرئيسية: {p.image}</span>
            <span className="break-all text-xs">صور إضافية: {(p.images || []).join(", ")}</span>
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleEditProduct(i)} className="bg-yellow-500 text-white px-3 py-1 rounded" disabled={loading}>تعديل</button>
              <button onClick={() => handleDeleteProduct(i)} className="bg-red-500 text-white px-3 py-1 rounded" disabled={loading}>حذف</button>
            </div>
          </div>
        ))}
      </div>

      {/* قسم إدارة روابط التواصل الاجتماعي */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-bold mb-4">روابط التواصل الاجتماعي العامة</h2>
        <form onSubmit={handleSaveSocials} className="flex flex-wrap gap-4 items-center">
          <input type="text" placeholder="رابط فيسبوك" value={socials.facebook} onChange={e => setSocials({ ...socials, facebook: e.target.value })} className="border px-3 py-2 rounded" />
          <input type="text" placeholder="رابط إنستجرام" value={socials.instagram} onChange={e => setSocials({ ...socials, instagram: e.target.value })} className="border px-3 py-2 rounded" />
          <input type="text" placeholder="رابط سناب شات" value={socials.snapchat} onChange={e => setSocials({ ...socials, snapchat: e.target.value })} className="border px-3 py-2 rounded" />
          <input type="text" placeholder="رقم واتساب (بدون +)" value={socials.whatsapp} onChange={e => setSocials({ ...socials, whatsapp: e.target.value })} className="border px-3 py-2 rounded" />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded" disabled={socialsLoading}>حفظ الروابط</button>
        </form>
        {socialsMsg && <p className="mt-2 text-green-600">{socialsMsg}</p>}
      </div>
    </div>
  );
} 