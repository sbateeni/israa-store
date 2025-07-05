import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';

const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_3rYI5trXqmi2Rgmd_40mfx02cgDWi0OdNFlLEf8fa1ZTQXi";
const SETTINGS_BLOB_KEY = "site-settings.json";

export async function GET() {
  try {
    // محاولة جلب الإعدادات من Blob Storage
    const res = await fetch(`${BLOB_API_URL}/list?prefix=${SETTINGS_BLOB_KEY}`, {
      headers: {
        Authorization: `Bearer ${BLOB_TOKEN}`,
      },
    });

    if (!res.ok) {
      // إذا لم توجد إعدادات، إرجاع الإعدادات الافتراضية
      return NextResponse.json({
        whatsapp: "",
        facebook: "",
        instagram: "",
        snapchat: "",
        dashboardPassword: "", // كلمة المرور محفوظة على الخادم فقط
      });
    }

    const data = await res.json();
    const settingsBlob = data.blobs?.find((blob: any) => blob.pathname === SETTINGS_BLOB_KEY);

    if (!settingsBlob) {
      // إذا لم توجد إعدادات، إرجاع الإعدادات الافتراضية
      return NextResponse.json({
        whatsapp: "",
        facebook: "",
        instagram: "",
        snapchat: "",
        dashboardPassword: "", // كلمة المرور محفوظة على الخادم فقط
      });
    }

    // جلب محتوى ملف الإعدادات
    const settingsRes = await fetch(settingsBlob.url);
    if (!settingsRes.ok) {
      throw new Error("فشل جلب الإعدادات");
    }

    const settings = await settingsRes.json();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    // في حالة الخطأ، إرجاع الإعدادات الافتراضية
    return NextResponse.json({
      whatsapp: "",
      facebook: "",
      instagram: "",
      snapchat: "",
      dashboardPassword: "", // كلمة المرور محفوظة على الخادم فقط
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 500 });
    }

    const settings = await req.json();
    console.log('Received settings:', settings);
    
    // التحقق من صحة البيانات
    if (!settings || typeof settings !== 'object') {
      console.error('Invalid settings data:', settings);
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }
    
    // التأكد من وجود الحقول المطلوبة
    const validatedSettings = {
      whatsapp: settings.whatsapp || "",
      facebook: settings.facebook || "",
      instagram: settings.instagram || "",
      snapchat: settings.snapchat || "",
      dashboardPassword: settings.dashboardPassword || "",
    };
    
    console.log('Saving validated settings:', validatedSettings);
    
    // إنشاء Blob من البيانات
    const blob = new Blob([JSON.stringify(validatedSettings)], { type: "application/json" });
    
    // حفظ الإعدادات في Vercel Blob Storage
    const { url } = await put(SETTINGS_BLOB_KEY, blob, { 
      access: 'public', 
      token,
      allowOverwrite: true 
    });
    
    console.log('Settings saved successfully to:', url);
    
    return NextResponse.json({ 
      success: true, 
      url,
      message: 'Settings saved successfully' 
    });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل حفظ الإعدادات' 
    }, { status: 500 });
  }
} 