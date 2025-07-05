import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';

const BLOB_API_URL = "https://api.vercel.com/v2/blob";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_3rYI5trXqmi2Rgmd_40mfx02cgDWi0OdNFlLEf8fa1ZTQXi";
const SOCIAL_BLOB_KEY = "social-links.json";
const PASSWORD_BLOB_KEY = "dashboard-password.json";

export async function GET() {
  try {
    console.log('Fetching settings from Vercel Blob Storage...');
    
    // محاولة جلب الإعدادات من Blob Storage
    const [socialRes, passRes] = await Promise.all([
      fetch(`${BLOB_API_URL}/get?pathname=${SOCIAL_BLOB_KEY}`, { 
        headers: { Authorization: `Bearer ${BLOB_TOKEN}` } 
      }),
      fetch(`${BLOB_API_URL}/get?pathname=${PASSWORD_BLOB_KEY}`, { 
        headers: { Authorization: `Bearer ${BLOB_TOKEN}` } 
      })
    ]);

    console.log('Blob response status:', socialRes.status, passRes.status);

    let social = { whatsapp: "", facebook: "", instagram: "", snapchat: "" };
    let password = { dashboardPassword: "" };

    if (socialRes.ok) {
      const socialData = await socialRes.json();
      console.log('Social data loaded:', socialData);
      social = socialData;
    } else {
      console.log('Social blob not found, using defaults');
    }

    if (passRes.ok) {
      const passData = await passRes.json();
      console.log('Password data loaded:', passData);
      password = passData;
    } else {
      console.log('Password blob not found, using defaults');
    }

    const combinedSettings = { ...social, ...password };
    console.log('Combined settings to return:', combinedSettings);
    return NextResponse.json(combinedSettings);
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
    console.log('Received POST request with body:', body);
    
    // التحقق من وجود البيانات
    if (!body) {
      console.error('No body received');
      return NextResponse.json({ error: 'No data received' }, { status: 400 });
    }

    // تجهيز بيانات التواصل الاجتماعي
    const social = {
      whatsapp: body.whatsapp || "",
      facebook: body.facebook || "",
      instagram: body.instagram || "",
      snapchat: body.snapchat || ""
    };

    // تجهيز بيانات كلمة المرور
    const password = { 
      dashboardPassword: body.dashboardPassword || "" 
    };

    console.log('Prepared social data:', social);
    console.log('Prepared password data:', password);
    
    // التحقق من صحة البيانات
    if (typeof social !== 'object' || typeof password !== 'object') {
      console.error('Invalid data structure:', { social, password });
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 400 });
    }
    
    console.log('Saving to Vercel Blob Storage...');
    
    // إنشاء Blobs من البيانات
    const socialBlob = new Blob([JSON.stringify(social, null, 2)], { type: "application/json" });
    const passBlob = new Blob([JSON.stringify(password, null, 2)], { type: "application/json" });
    
    console.log('Social blob size:', socialBlob.size, 'bytes');
    console.log('Password blob size:', passBlob.size, 'bytes');
    
    // حفظ الإعدادات في Vercel Blob Storage
    console.log('Saving social links...');
    const socialResult = await put(SOCIAL_BLOB_KEY, socialBlob, { 
      access: 'public', 
      token: BLOB_TOKEN,
      allowOverwrite: true 
    });
    console.log('Social links saved:', socialResult.url);

    console.log('Saving password...');
    const passResult = await put(PASSWORD_BLOB_KEY, passBlob, { 
      access: 'public', 
      token: BLOB_TOKEN,
      allowOverwrite: true 
    });
    console.log('Password saved:', passResult.url);
    
    console.log('All settings saved successfully to Vercel Blob Storage');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Settings saved successfully to Vercel Blob Storage',
      socialUrl: socialResult.url,
      passwordUrl: passResult.url
    });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل حفظ الإعدادات' 
    }, { status: 500 });
  }
} 