import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';
import { writeFile, readFile, access } from 'fs/promises';
import { join } from 'path';

const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_3rYI5trXqmi2Rgmd_40mfx02cgDWi0OdNFlLEf8fa1ZTQXi";
const SETTINGS_BLOB_KEY = "site-settings.json";

// مسار ملف الإعدادات المحلي
const LOCAL_SETTINGS_PATH = join(process.cwd(), 'data', 'site-settings.json');

// دالة للتحقق من وجود الملف المحلي
async function localFileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// دالة لحفظ الإعدادات محلياً
async function saveSettingsLocally(settings: any): Promise<void> {
  try {
    // إنشاء مجلد data إذا لم يكن موجوداً
    const { mkdir } = await import('fs/promises');
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
    
    // حفظ الإعدادات
    await writeFile(LOCAL_SETTINGS_PATH, JSON.stringify(settings, null, 2));
    console.log('Settings saved locally to:', LOCAL_SETTINGS_PATH);
  } catch (error) {
    console.error('Error saving settings locally:', error);
    throw error;
  }
}

// دالة لجلب الإعدادات محلياً
async function loadSettingsLocally(): Promise<any> {
  try {
    if (await localFileExists(LOCAL_SETTINGS_PATH)) {
      const data = await readFile(LOCAL_SETTINGS_PATH, 'utf-8');
      const settings = JSON.parse(data);
      console.log('Settings loaded locally:', settings);
      return settings;
    }
    return null;
  } catch (error) {
    console.error('Error loading settings locally:', error);
    return null;
  }
}

export async function GET() {
  try {
    console.log('Fetching settings...');
    
    // في البيئة المحلية، استخدم التخزين المحلي
    if (process.env.NODE_ENV === 'development') {
      console.log('Using local storage in development');
      const localSettings = await loadSettingsLocally();
      
      if (localSettings) {
        console.log('Retrieved local settings:', localSettings);
        return NextResponse.json(localSettings);
      }
      
      // إذا لم توجد إعدادات محلية، إرجاع الإعدادات الافتراضية
      console.log('No local settings found, returning defaults');
      return NextResponse.json({
        whatsapp: "",
        facebook: "",
        instagram: "",
        snapchat: "",
        dashboardPassword: "",
      });
    }
    
    // في الإنتاج، استخدم Vercel Blob Storage
    console.log('Using Vercel Blob Storage in production');
    
    // محاولة جلب الإعدادات من Blob Storage
    const res = await fetch(`${BLOB_API_URL}/list?prefix=${SETTINGS_BLOB_KEY}`, {
      headers: {
        Authorization: `Bearer ${BLOB_TOKEN}`,
      },
    });

    console.log('Blob list response status:', res.status);

    if (!res.ok) {
      console.log('Blob list failed, returning default settings');
      return NextResponse.json({
        whatsapp: "",
        facebook: "",
        instagram: "",
        snapchat: "",
        dashboardPassword: "",
      });
    }

    const data = await res.json();
    console.log('Blob list data:', data);
    
    const settingsBlob = data.blobs?.find((blob: any) => blob.pathname === SETTINGS_BLOB_KEY);
    console.log('Settings blob found:', !!settingsBlob);

    if (!settingsBlob) {
      console.log('No settings blob found, returning default settings');
      return NextResponse.json({
        whatsapp: "",
        facebook: "",
        instagram: "",
        snapchat: "",
        dashboardPassword: "",
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
    return NextResponse.json({
      whatsapp: "",
      facebook: "",
      instagram: "",
      snapchat: "",
      dashboardPassword: "",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
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
    
    // في البيئة المحلية، استخدم التخزين المحلي
    if (process.env.NODE_ENV === 'development') {
      console.log('Saving settings locally in development');
      await saveSettingsLocally(validatedSettings);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Settings saved locally successfully' 
      });
    }
    
    // في الإنتاج، استخدم Vercel Blob Storage
    console.log('Saving settings to Vercel Blob Storage in production');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    console.log('BLOB_TOKEN available:', !!token);
    
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 500 });
    }
    
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