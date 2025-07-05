# إعداد Vercel Blob Storage

## المشكلة الحالية
يبدو أن هناك خطأ 500 في رفع الملفات بسبب عدم وجود `BLOB_READ_WRITE_TOKEN`.

## الحل

### 1. إنشاء Vercel Blob Store
1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر مشروعك
3. اذهب إلى تبويب "Storage"
4. اضغط "Create Store"
5. اختر "Blob"
6. أعطِ اسماً للمتجر (مثل `isra-store-blob`)

### 2. الحصول على Token
1. بعد إنشاء المتجر، اذهب إلى تبويب "Settings"
2. ابحث عن "Tokens"
3. انسخ `BLOB_READ_WRITE_TOKEN`

### 3. إضافة المتغير البيئي
1. في Vercel Dashboard، اذهب إلى تبويب "Settings"
2. ابحث عن "Environment Variables"
3. أضف متغير جديد:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: الصق الـ token الذي نسخته
   - **Environment**: Production, Preview, Development

### 4. إعادة النشر
1. اذهب إلى تبويب "Deployments"
2. اضغط "Redeploy" على آخر deployment

## للتطوير المحلي
أنشئ ملف `.env.local` في مجلد المشروع:
```
BLOB_READ_WRITE_TOKEN=your_token_here
```

## التحقق من الإعداد
بعد إضافة الـ token، جرب رفع ملف في لوحة التحكم. يجب أن يعمل بدون أخطاء.

## ملاحظات
- تأكد من أن الـ token صحيح وغير منتهي الصلاحية
- إذا استمرت المشكلة، تحقق من logs في Vercel Dashboard 