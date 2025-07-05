import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';
import { writeFile, readFile, access } from 'fs/promises';
import { join } from 'path';

const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_3rYI5trXqmi2Rgmd_40mfx02cgDWi0OdNFlLEf8fa1ZTQXi";
const SOCIAL_BLOB_KEY = "social-links.json";
const PASSWORD_BLOB_KEY = "dashboard-password.json";

const LOCAL_SOCIAL_PATH = join(process.cwd(), 'data', 'social-links.json');
const LOCAL_PASSWORD_PATH = join(process.cwd(), 'data', 'dashboard-password.json');

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
async function saveLocally(path: string, data: any): Promise<void> {
  try {
    // إنشاء مجلد data إذا لم يكن موجوداً
    const { mkdir } = await import('fs/promises');
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
    
    // حفظ الإعدادات
    await writeFile(path, JSON.stringify(data, null, 2));
    console.log('Settings saved locally to:', path);
  } catch (error) {
    console.error('Error saving settings locally:', error);
    throw error;
  }
}

// دالة لجلب الإعدادات محلياً
async function loadLocally(path: string): Promise<any> {
  try {
    if (await localFileExists(path)) {
      const data = await readFile(path, 'utf-8');
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
      const social = await loadLocally(LOCAL_SOCIAL_PATH) || {
        whatsapp: "",
        facebook: "",
        instagram: "",
        snapchat: ""
      };
      const password = await loadLocally(LOCAL_PASSWORD_PATH) || { dashboardPassword: "" };
      return NextResponse.json({ ...social, ...password });
    }
    
    // في الإنتاج، استخدم Vercel Blob Storage
    console.log('Using Vercel Blob Storage in production');
    
    // محاولة جلب الإعدادات من Blob Storage
    const [socialRes, passRes] = await Promise.all([
      fetch(`${BLOB_API_URL}/get?pathname=${SOCIAL_BLOB_KEY}`, { headers: { Authorization: `Bearer ${BLOB_TOKEN}` } }),
      fetch(`${BLOB_API_URL}/get?pathname=${PASSWORD_BLOB_KEY}`, { headers: { Authorization: `Bearer ${BLOB_TOKEN}` } })
    ]);

    console.log('Blob list response status:', socialRes.status, passRes.status);

    let social = { whatsapp: "", facebook: "", instagram: "", snapchat: "" };
    let password = { dashboardPassword: "" };

    if (socialRes.ok) social = await socialRes.json();
    if (passRes.ok) password = await passRes.json();

    return NextResponse.json({ ...social, ...password });
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
    const body = await req.json();
    const social = {
      whatsapp: body.whatsapp || "",
      facebook: body.facebook || "",
      instagram: body.instagram || "",
      snapchat: body.snapchat || ""
    };
    const password = { dashboardPassword: body.dashboardPassword || "" };
    console.log('Received settings:', { social, password });
    
    // التحقق من صحة البيانات
    if (!social || !password) {
      console.error('Invalid settings data:', { social, password });
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
    }
    
    console.log('Saving validated settings:', { social, password });
    
    // في البيئة المحلية، استخدم التخزين المحلي
    if (process.env.NODE_ENV === 'development') {
      console.log('Saving settings locally in development');
      await saveLocally(LOCAL_SOCIAL_PATH, social);
      await saveLocally(LOCAL_PASSWORD_PATH, password);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Settings saved locally successfully' 
      });
    }
    
    // في الإنتاج، استخدم Vercel Blob Storage
    console.log('Saving settings to Vercel Blob Storage in production');
    
    // إنشاء Blobs من البيانات
    const socialBlob = new Blob([JSON.stringify(social)], { type: "application/json" });
    const passBlob = new Blob([JSON.stringify(password)], { type: "application/json" });
    console.log('Blob sizes:', socialBlob.size, passBlob.size, 'bytes');
    
    // حفظ الإعدادات في Vercel Blob Storage
    console.log('Attempting to save to Vercel Blob Storage...');
    await put(SOCIAL_BLOB_KEY, socialBlob, { 
      access: 'public', 
      token: BLOB_TOKEN,
      allowOverwrite: true 
    });
    await put(PASSWORD_BLOB_KEY, passBlob, { 
      access: 'public', 
      token: BLOB_TOKEN,
      allowOverwrite: true 
    });
    
    console.log('Settings saved successfully to Vercel Blob Storage');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully to Vercel Blob Storage' 
    });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل حفظ الإعدادات' 
    }, { status: 500 });
  }
} 