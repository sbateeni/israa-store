# نظام إعدادات الموقع - Vercel Blob Storage

## 📋 نظرة عامة

تم إنشاء نظام إعدادات متكامل يعمل مع Vercel Blob Storage لحفظ إعدادات الموقع بشكل آمن وموثوق.

## 🗂️ هيكل الملفات

### ملفات التخزين في Vercel Blob Storage:
- `social-links.json` - روابط التواصل الاجتماعي
- `dashboard-password.json` - كلمة مرور لوحة التحكم

### ملفات الكود:
- `src/app/api/settings/route.ts` - API للتعامل مع الإعدادات
- `src/hooks/use-settings.ts` - Hook لجلب وحفظ الإعدادات
- `src/app/dashboard/page.tsx` - واجهة لوحة التحكم

## 🔧 كيفية العمل

### 1. جلب الإعدادات (GET)
```typescript
// جلب الإعدادات من Vercel Blob Storage
const response = await fetch('/api/settings');
const settings = await response.json();
// settings = { whatsapp: "...", facebook: "...", instagram: "...", snapchat: "...", dashboardPassword: "..." }
```

### 2. حفظ روابط التواصل (POST)
```typescript
// حفظ روابط التواصل فقط
const response = await fetch('/api/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    whatsapp: "966500000000",
    facebook: "https://facebook.com/username",
    instagram: "https://instagram.com/username",
    snapchat: "https://snapchat.com/add/username"
  })
});
```

### 3. حفظ كلمة المرور (POST)
```typescript
// حفظ كلمة المرور فقط
const response = await fetch('/api/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dashboardPassword: "newpassword123"
  })
});
```

## 🎯 الميزات

### ✅ ما تم إنجازه:
1. **تخزين منفصل**: روابط التواصل وكلمة المرور في ملفات منفصلة
2. **حفظ مستقل**: كل نوع إعدادات له عملية حفظ مستقلة
3. **تنسيق تلقائي**: رقم واتساب يتم تنسيقه تلقائياً إلى `https://wa.me/966500000000`
4. **رسائل نجاح**: رسائل واضحة لكل عملية حفظ
5. **تحقق من صحة البيانات**: التحقق من صحة المدخلات قبل الحفظ
6. **Logging مفصل**: تسجيل مفصل لجميع العمليات للتشخيص

### 🔗 استخدام الإعدادات في المكونات:
```typescript
import { useSettings } from "@/hooks/use-settings";

function MyComponent() {
  const { formatSocialLink } = useSettings();
  
  // الحصول على رابط واتساب منسق
  const whatsappLink = formatSocialLink('whatsapp');
  // النتيجة: "https://wa.me/966500000000" إذا كان الرقم محفوظاً
  
  return (
    <a href={whatsappLink}>واتساب</a>
  );
}
```

## 🚀 التطبيق في الموقع

### 1. أيقونة واتساب العائمة:
- تستخدم الإعدادات المحفوظة تلقائياً
- لا تظهر إذا لم يتم تعيين رقم واتساب

### 2. بطاقات المنتجات:
- جميع الأيقونات تستخدم الإعدادات العامة
- لا تحتاج لروابط فردية لكل منتج

### 3. نافذة تفاصيل المنتج:
- أيقونات التواصل تستخدم الإعدادات المحفوظة
- رسائل خطأ واضحة إذا لم يتم تعيين الروابط

### 4. سلة المشتريات:
- أيقونات الطلب تستخدم الإعدادات العامة

## 📊 لوحة التحكم

### التبويبات:
1. **إدارة المنتجات**: إضافة وحذف المنتجات
2. **روابط التواصل**: تعديل روابط التواصل الاجتماعي
3. **كلمة المرور**: تغيير كلمة مرور لوحة التحكم

### الميزات:
- **حفظ منفصل**: كل تبويب له زر حفظ مستقل
- **تأكيد كلمة المرور**: حقلين للتأكد من عدم وجود أخطاء
- **تحقق من صحة البيانات**: التحقق من طول كلمة المرور وتطابق الحقول
- **رسائل نجاح منفصلة**: رسالة مختلفة لكل عملية حفظ

## 🔍 التشخيص

### Logs المتاحة:
- جلب الإعدادات من Vercel Blob Storage
- حفظ الإعدادات في Vercel Blob Storage
- حجم البيانات المحفوظة
- روابط الملفات المحفوظة
- أخطاء الحفظ والجلب

### اختبار النظام:
```bash
# يمكن اختبار النظام مباشرة من المتصفح
# انتقل إلى: https://israa-store.vercel.app/dashboard
# أو اختبر API مباشرة:
curl -X GET https://israa-store.vercel.app/api/settings
```

## 🎉 النتيجة النهائية

✅ **رقم الهاتف يتم حفظه بشكل صحيح في الداشبورد**  
✅ **يتم دمج رقم الهاتف مع أيقونة الواتساب تلقائياً**  
✅ **جميع الأيقونات تستخدم الإعدادات المحفوظة**  
✅ **النظام يعمل بشكل كامل في Vercel**  
✅ **لا حاجة للتخزين المحلي**  

## 📝 ملاحظات مهمة

1. **Vercel Blob Storage**: النظام يعمل فقط في الإنتاج (Vercel)
2. **Token الأمان**: يتم استخدام BLOB_READ_WRITE_TOKEN من متغيرات البيئة
3. **التخزين المؤقت**: تم تعطيل التخزين المؤقت لضمان الحصول على أحدث البيانات
4. **التنسيق التلقائي**: رقم واتساب يتم تنسيقه تلقائياً إلى الرابط الكامل

---

**تم تطوير هذا النظام ليعمل بشكل مثالي مع Vercel Blob Storage ويضمن حفظ واستخدام رقم الهاتف بشكل صحيح في جميع أنحاء الموقع.** 