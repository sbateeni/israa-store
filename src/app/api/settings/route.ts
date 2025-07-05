import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';

const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_3rYI5trXqmi2Rgmd_40mfx02cgDWi0OdNFlLEf8fa1ZTQXi";
const SETTINGS_BLOB_KEY = "site-settings.json";

export async function GET() {
  try {
    console.log('Fetching settings from Vercel Blob Storage...');
    
    // محاولة جلب الإعدادات من Blob Storage
    const res = await fetch(`${BLOB_API_URL}/list?prefix=${SETTINGS_BLOB_KEY}`, {
      headers: {
        Authorization: `Bearer ${BLOB_TOKEN}`,
      },
    });

    console.log('Blob list response status:', res.status);

    if (!res.ok) {
      console.log('Blob list failed, returning default settings');
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
    console.log('Blob list data:', data);
    
    const settingsBlob = data.blobs?.find((blob: any) => blob.pathname === SETTINGS_BLOB_KEY);
    console.log('Settings blob found:', !!settingsBlob);

    if (!settingsBlob) {
      console.log('No settings blob found, returning default settings');
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
    console.log('Fetching settings content from:', settingsBlob.url);
    const settingsRes = await fetch(settingsBlob.url);
    
    if (!settingsRes.ok) {
      console.error('Failed to fetch settings content:', settingsRes.status);
      throw new Error("فشل جلب الإعدادات");
    }

    const settings = await settingsRes.json();
    console.log('Retrieved settings:', settings);
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
    console.log('BLOB_TOKEN available:', !!token);
    
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
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
    console.log('Blob size:', blob.size, 'bytes');
    
    // حفظ الإعدادات في Vercel Blob Storage
    console.log('Attempting to save to Vercel Blob Storage...');
    const { url } = await put(SETTINGS_BLOB_KEY, blob, { 
      access: 'public', 
      token,
      allowOverwrite: true 
    });
    
    console.log('Settings saved successfully to:', url);
    
    // التحقق من أن الملف تم حفظه بنجاح
    const verifyRes = await fetch(`${BLOB_API_URL}/list?prefix=${SETTINGS_BLOB_KEY}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (verifyRes.ok) {
      const verifyData = await verifyRes.json();
      const savedBlob = verifyData.blobs?.find((blob: any) => blob.pathname === SETTINGS_BLOB_KEY);
      console.log('Verification - saved blob found:', !!savedBlob);
    }
    
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