import { NextRequest, NextResponse } from "next/server";
import { put, list } from '@vercel/blob';

const SOCIAL_BLOB_KEY = "social-links.json";
const PASSWORD_BLOB_KEY = "dashboard-password.json";

export async function GET() {
  try {
    console.log('Fetching settings from Vercel Blob Storage...');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({
        whatsapp: "",
        facebook: "",
        instagram: "",
        snapchat: "",
        dashboardPassword: "",
      });
    }
    
    // جلب جميع الملفات من Blob Storage
    const { blobs } = await list();
    console.log('Available blobs:', blobs.map(b => b.pathname));
    
    let social = { whatsapp: "", facebook: "", instagram: "", snapchat: "" };
    let password = { dashboardPassword: "" };

    // البحث عن ملف social-links.json
    const socialBlob = blobs.find(blob => blob.pathname === SOCIAL_BLOB_KEY);
    if (socialBlob) {
      try {
        console.log('Found social blob, fetching content...');
        const response = await fetch(socialBlob.url);
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const socialData = JSON.parse(text);
            console.log('Social data loaded:', socialData);
            social = socialData;
          }
        }
      } catch (error) {
        console.error('Error reading social blob:', error);
      }
    } else {
      console.log('Social blob not found, using defaults');
    }

    // البحث عن ملف dashboard-password.json
    const passwordBlob = blobs.find(blob => blob.pathname === PASSWORD_BLOB_KEY);
    if (passwordBlob) {
      try {
        console.log('Found password blob, fetching content...');
        const response = await fetch(passwordBlob.url);
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const passwordData = JSON.parse(text);
            console.log('Password data loaded:', passwordData);
            password = passwordData;
          }
        }
      } catch (error) {
        console.error('Error reading password blob:', error);
      }
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
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 500 });
    }
    
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
      token,
      allowOverwrite: true 
    });
    console.log('Social links saved:', socialResult.url);

    console.log('Saving password...');
    const passResult = await put(PASSWORD_BLOB_KEY, passBlob, { 
      access: 'public', 
      token,
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