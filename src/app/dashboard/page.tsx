"use client";
import React, { useState, useEffect, useRef } from "react";
import { fetchProducts, saveProducts, uploadMedia, deleteProduct, fetchSiteSettings, saveSiteSettings } from "@/lib/products";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  video?: string;
  videos?: string[];
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
    images: [] as File[],
    videos: [] as File[],
    mainImageIndex: 0,
    whatsapp: "",
    facebook: "",
    instagram: "",
    snapchat: "",
  });
  
  // إعدادات الموقع العامة
  const [siteSettings, setSiteSettings] = useState({
    whatsapp: "",
    facebook: "",
    instagram: "",
    snapchat: "",
    dashboardPassword: "",
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

  // تحميل إعدادات الموقع من الخادم
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchSiteSettings();
        
        // استخراج الرقم من رابط واتساب للعرض
        let whatsappDisplay = settings.whatsapp || "";
        if (whatsappDisplay.startsWith('https://wa.me/')) {
          whatsappDisplay = whatsappDisplay.replace('https://wa.me/', '');
        }
        
        setSiteSettings({
          ...settings,
          whatsapp: whatsappDisplay
        });
      } catch (error) {
        console.error('Error loading settings:', error);
        // في حالة الخطأ، استخدام الإعدادات الافتراضية
        setSiteSettings({
          whatsapp: "966500000000",
          facebook: "",
          instagram: "",
          snapchat: "",
          dashboardPassword: "",
        });
      }
    };
    
    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSiteSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      // تنسيق روابط التواصل الاجتماعي قبل الحفظ
      let formattedSettings = { ...siteSettings };
      
      // تنسيق رابط واتساب
      if (formattedSettings.whatsapp && !formattedSettings.whatsapp.startsWith('https://wa.me/')) {
        // إذا كان المستخدم كتب رقم فقط، أضف الرابط الكامل
        if (formattedSettings.whatsapp.match(/^\d+$/)) {
          formattedSettings.whatsapp = `https://wa.me/${formattedSettings.whatsapp}`;
        }
      }
      
      // حفظ الإعدادات على الخادم
      await saveSiteSettings(formattedSettings);
      
      // تحديث الحالة المحلية
      setSiteSettings(formattedSettings);
      
      setMessage({ type: 'success', text: 'تم حفظ إعدادات الموقع بنجاح' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'فشل حفظ إعدادات الموقع' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setForm((prev) => ({ ...prev, [name]: fileArray }));
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const newMainIndex = prev.mainImageIndex >= newImages.length ? 0 : prev.mainImageIndex;
      return {
        ...prev,
        images: newImages,
        mainImageIndex: newMainIndex
      };
    });
  };

  const removeVideo = (index: number) => {
    setForm(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];
      
      // رفع الصور
      if (form.images.length > 0) {
        for (const image of form.images) {
          const url = await uploadMedia(image);
          imageUrls.push(url);
        }
      }
      
      // رفع الفيديوهات
      if (form.videos.length > 0) {
        for (const video of form.videos) {
          const url = await uploadMedia(video);
          videoUrls.push(url);
        }
      }
      
      // تنسيق روابط التواصل الاجتماعي
      let whatsappUrl = form.whatsapp || siteSettings.whatsapp;
      let facebookUrl = form.facebook || siteSettings.facebook;
      let instagramUrl = form.instagram || siteSettings.instagram;
      let snapchatUrl = form.snapchat || siteSettings.snapchat;

      // تنسيق رابط واتساب
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
        image: imageUrls[form.mainImageIndex] || imageUrls[0] || undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        video: videoUrls[0] || undefined,
        videos: videoUrls.length > 0 ? videoUrls : undefined,
        whatsapp: whatsappUrl || undefined,
        facebook: facebookUrl || undefined,
        instagram: instagramUrl || undefined,
        snapchat: snapchatUrl || undefined,
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
        images: [],
        videos: [],
        mainImageIndex: 0,
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
      images: [],
      videos: [],
      mainImageIndex: 0,
      whatsapp: whatsappDisplay,
      facebook: product.facebook || "",
      instagram: product.instagram || "",
      snapchat: product.snapchat || "",
    });
    
    // إظهار رسالة للمستخدم عن الصور والفيديوهات الموجودة
    let message = "";
    if (product.images && product.images.length > 1) {
      message += `المنتج يحتوي على ${product.images.length} صور. `;
    }
    if (product.videos && product.videos.length > 1) {
      message += `المنتج يحتوي على ${product.videos.length} فيديوهات. `;
    }
    if (message) {
      setMessage({ type: 'success', text: message + 'يمكنك إضافة صور وفيديوهات جديدة أو الاحتفاظ بالحالية.' });
      setTimeout(() => setMessage(null), 5000);
    }
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
      <div className="flex justify-between items-center mb-4">
        <button
          className="text-sm text-blue-600 underline"
          onClick={() => {
            localStorage.removeItem("israa_dashboard_auth");
            router.push("/login");
          }}
        >
          تسجيل الخروج
        </button>
      </div>
      
      {/* إعدادات الموقع العامة */}
      <div className="border p-4 rounded mb-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">إعدادات الموقع العامة</h2>
        <p className="text-sm text-gray-600 mb-4">هذه الروابط ستُستخدم تلقائياً في جميع المنتجات الجديدة</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-green-600 font-medium">رابط واتساب الافتراضي</label>
            <input
              name="whatsapp"
              type="url"
              value={siteSettings.whatsapp}
              onChange={handleSettingsChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://wa.me/966500000000"
            />
            <p className="text-xs text-gray-500 mt-1">اكتب الرقم فقط بدون + (مثال: 966500000000)</p>
          </div>
          <div>
            <label className="block mb-1 text-blue-600 font-medium">رابط فيسبوك الافتراضي</label>
            <input
              name="facebook"
              type="url"
              value={siteSettings.facebook}
              onChange={handleSettingsChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://facebook.com/username"
            />
          </div>
          <div>
            <label className="block mb-1 text-purple-600 font-medium">رابط انستغرام الافتراضي</label>
            <input
              name="instagram"
              type="url"
              value={siteSettings.instagram}
              onChange={handleSettingsChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://instagram.com/username"
            />
          </div>
          <div>
            <label className="block mb-1 text-yellow-600 font-medium">رابط سناب شات الافتراضي</label>
            <input
              name="snapchat"
              type="url"
              value={siteSettings.snapchat}
              onChange={handleSettingsChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://snapchat.com/add/username"
            />
          </div>
          <div>
            <label className="block mb-1 text-red-600 font-medium">كلمة مرور لوحة التحكم</label>
            <input
              name="dashboardPassword"
              type="password"
              value={siteSettings.dashboardPassword}
              onChange={handleSettingsChange}
              className="border rounded w-full p-2 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="كلمة المرور الجديدة"
            />
            <p className="text-xs text-gray-500 mt-1">
              {siteSettings.dashboardPassword ? 
                "كلمة المرور محفوظة على الخادم" : 
                "أدخل كلمة مرور جديدة (كلمة المرور الافتراضية: israa2024)"
              }
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveSettings}
          className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-md"
        >
          حفظ الإعدادات
        </button>
      </div>
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
          <label className="block mb-1">صور المنتج (يمكن اختيار عدة صور)</label>
          <p className="text-sm text-gray-600 mb-2">انقر على الصورة لاختيارها كصورة رئيسية، أو اضغط × لحذفها</p>
          {form.images.length > 0 && (
            <p className="text-sm text-blue-600 mb-2">تم اختيار {form.images.length} صورة</p>
          )}
          <input
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            ref={imageInputRef}
            className="border rounded w-full p-2 bg-white text-gray-900"
          />
          {form.images.length > 0 && (
            <div className="mt-3">
              <label className="block mb-2 text-sm font-medium">اختر الصورة الرئيسية:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {form.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`صورة ${index + 1}`}
                      className={`w-full h-24 object-cover rounded border-2 cursor-pointer transition-all ${
                        form.mainImageIndex === index ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
                      }`}
                      onClick={() => setForm(prev => ({ ...prev, mainImageIndex: index }))}
                    />
                    {form.mainImageIndex === index && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                        رئيسية
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block mb-1">فيديوهات المنتج (يمكن اختيار عدة فيديوهات)</label>
          <p className="text-sm text-gray-600 mb-2">اضغط "حذف" لإزالة أي فيديو من القائمة</p>
          {form.videos.length > 0 && (
            <p className="text-sm text-green-600 mb-2">تم اختيار {form.videos.length} فيديو</p>
          )}
          <input
            name="videos"
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileChange}
            ref={videoInputRef}
            className="border rounded w-full p-2 bg-white text-gray-900"
          />
          {form.videos.length > 0 && (
            <div className="mt-3">
              <label className="block mb-2 text-sm font-medium">الفيديوهات المختارة:</label>
              <div className="space-y-2">
                {form.videos.map((video, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <video
                      src={URL.createObjectURL(video)}
                      className="w-16 h-12 object-cover rounded"
                      muted
                    />
                    <span className="text-sm text-gray-700 flex-1">{video.name}</span>
                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Social Media Links */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">روابط التواصل الاجتماعي (اختياري)</h3>
          <p className="text-sm text-gray-600 mb-4">اتركها فارغة لاستخدام الإعدادات العامة، أو اكتب روابط خاصة لهذا المنتج</p>
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
                images: [],
                videos: [],
                mainImageIndex: 0,
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
                  <div className="mt-2">
                    <img src={product.image} alt={product.name} className="w-32 h-32 object-cover rounded" />
                    {product.images && product.images.length > 1 && (
                      <p className="text-xs text-gray-500 mt-1">+ {product.images.length - 1} صور إضافية</p>
                    )}
                  </div>
                )}
                {product.video && (
                  <div className="mt-2">
                    <video src={product.video} controls className="w-32 h-32 rounded" />
                    {product.videos && product.videos.length > 1 && (
                      <p className="text-xs text-gray-500 mt-1">+ {product.videos.length - 1} فيديوهات إضافية</p>
                    )}
                  </div>
                )}
                {/* Social Media Links Display */}
                <div className="flex gap-2 mt-2">
                  {(product.whatsapp || siteSettings.whatsapp) && (
                    <a href={product.whatsapp || siteSettings.whatsapp} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                      واتساب
                    </a>
                  )}
                  {(product.facebook || siteSettings.facebook) && (
                    <a href={product.facebook || siteSettings.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      فيسبوك
                    </a>
                  )}
                  {(product.instagram || siteSettings.instagram) && (
                    <a href={product.instagram || siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800">
                      انستغرام
                    </a>
                  )}
                  {(product.snapchat || siteSettings.snapchat) && (
                    <a href={product.snapchat || siteSettings.snapchat} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:text-yellow-800">
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
