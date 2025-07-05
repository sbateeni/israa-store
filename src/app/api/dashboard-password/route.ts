import { NextRequest, NextResponse } from "next/server";
import { put, list } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

// دالة تشفير بسيطة لكلمة المرور
function encryptPassword(password: string): string {
  // تشفير بسيط - يمكن تحسينه لاحقاً
  return Buffer.from(password).toString('base64');
}

// دالة فك التشفير
function decryptPassword(encrypted: string): string {
  try {
    // التحقق من أن النص مشفر فعلاً
    if (!encrypted || encrypted.length < 4) {
      return encrypted; // إرجاع النص كما هو إذا لم يكن مشفراً
    }
    
    const decrypted = Buffer.from(encrypted, 'base64').toString('utf-8');
    
    // التحقق من أن النتيجة صحيحة
    if (!decrypted || decrypted.length === 0) {
      return encrypted; // إرجاع النص الأصلي إذا فشل فك التشفير
    }
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting password:', error);
    return encrypted; // إرجاع النص الأصلي بدلاً من كلمة مرور افتراضية
  }
}

// دالة للتحقق من أن الطلب يأتي من نفس الموقع
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  // التحقق من أن الطلب يأتي من نفس الموقع
  if (origin && !origin.includes('israa-store.vercel.app')) {
    return false;
  }
  
  if (referer && !referer.includes('israa-store.vercel.app')) {
    return false;
  }
  
  return true;
}

export async function GET(req: NextRequest) {
  try {
    console.log('=== GET /api/dashboard-password ===');
    
    // حماية إضافية - التحقق من مصدر الطلب
    if (!isSameOrigin(req)) {
      console.error('Unauthorized access attempt from external origin');
      return NextResponse.json({
        error: 'Unauthorized access'
      }, { status: 403 });
    }
    
    console.log('Fetching dashboard password from Vercel Blob Storage...');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({
        error: 'Missing BLOB_READ_WRITE_TOKEN',
        message: "BLOB_READ_WRITE_TOKEN not configured"
      }, { status: 500 });
    }
    
    // جلب جميع الملفات من Blob Storage
    const { blobs } = await list();
    console.log('Available blobs:', blobs.map(b => b.pathname));
    
    // البحث عن ملف كلمة المرور
    const passwordBlob = blobs.find(blob => blob.pathname === PASSWORD_BLOB_KEY);
    
    if (passwordBlob) {
      try {
        console.log('Found password blob, fetching content...');
        const response = await fetch(passwordBlob.url, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        if (response.ok) {
          const text = await response.text();
          console.log('Raw password blob content:', text);
          if (text) {
            const passwordData = JSON.parse(text);
            console.log('Password data loaded from blob:', passwordData);
            
            // التعامل مع كلا الشكلين من كلمة المرور
            let actualPassword = passwordData.password || passwordData.dashboardPassword || "";
            
            // فك تشفير كلمة المرور
            if (actualPassword && actualPassword !== "") {
              actualPassword = decryptPassword(actualPassword);
            }
            
            // إذا كان الملف يحتوي على dashboardPassword، نحوله إلى password
            if (passwordData.dashboardPassword && !passwordData.password) {
              console.log('Converting dashboardPassword to password format...');
              const correctedData = { password: encryptPassword(passwordData.dashboardPassword) };
              const correctedBlob = new Blob([JSON.stringify(correctedData, null, 2)], { type: "application/json" });
              
              try {
                await put(PASSWORD_BLOB_KEY, correctedBlob, { 
                  access: 'public', 
                  token,
                  allowOverwrite: true 
                });
                console.log('Password format corrected in blob storage');
                actualPassword = passwordData.dashboardPassword;
              } catch (error) {
                console.error('Error correcting password format:', error);
              }
            }
            
            if (!actualPassword) {
              return NextResponse.json({
                error: 'No password found in storage',
                message: "Password not configured"
              }, { status: 404 });
            }
            
            return NextResponse.json({
              password: actualPassword,
              message: "Password loaded from Vercel Blob Storage"
            }, {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
          }
        }
      } catch (error) {
        console.error('Error reading password blob:', error);
      }
    } else {
      console.log('Password blob not found, creating default...');
      // إنشاء كلمة المرور الافتراضية
      const defaultPassword = { password: encryptPassword("admin123") };
      const passwordBlob = new Blob([JSON.stringify(defaultPassword, null, 2)], { type: "application/json" });
      
      try {
        await put(PASSWORD_BLOB_KEY, passwordBlob, { 
          access: 'public', 
          token,
          allowOverwrite: true 
        });
        console.log('Default password created in blob storage');
        return NextResponse.json({
          password: "admin123",
          message: "Default password created in Vercel Blob Storage"
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } catch (error) {
        console.error('Error creating default password:', error);
        return NextResponse.json({
          error: 'Failed to create default password',
          message: "Error occurred while creating password"
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      error: 'No password found',
      message: "Password not configured"
    }, { status: 404 });
    
  } catch (error) {
    console.error("Error fetching password:", error);
    return NextResponse.json({
      error: 'Error occurred while fetching password',
      message: "Internal server error"
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== POST /api/dashboard-password ===');
    
    // حماية إضافية - التحقق من مصدر الطلب
    if (!isSameOrigin(req)) {
      console.error('Unauthorized access attempt from external origin');
      return NextResponse.json({
        error: 'Unauthorized access'
      }, { status: 403 });
    }
    
    const body = await req.json();
    console.log('Received password update request:', { newPassword: body.password ? '***' : 'undefined' });
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({
        error: 'Missing BLOB_READ_WRITE_TOKEN',
        message: "BLOB_READ_WRITE_TOKEN not configured"
      }, { status: 500 });
    }
    
    if (!body.password) {
      console.error('Password is required');
      return NextResponse.json({ 
        error: 'Password is required' 
      }, { status: 400 });
    }
    
    if (body.password.trim() === '') {
      console.error('Password cannot be empty');
      return NextResponse.json({ 
        error: 'Password cannot be empty' 
      }, { status: 400 });
    }
    
    // إنشاء كلمة المرور الجديدة
    const encryptedPassword = encryptPassword(body.password);
    const passwordData = { password: encryptedPassword };
    const passwordBlob = new Blob([JSON.stringify(passwordData, null, 2)], { type: "application/json" });
    
    console.log('Saving new password to Vercel Blob Storage...');
    const result = await put(PASSWORD_BLOB_KEY, passwordBlob, { 
      access: 'public', 
      token,
      allowOverwrite: true 
    });
    
    console.log('Password saved successfully:', result.url);
    
    // التحقق من أن كلمة المرور تم حفظها بشكل صحيح
    try {
      const verifyResponse = await fetch(result.url, { cache: 'no-store' });
      if (verifyResponse.ok) {
        const verifyText = await verifyResponse.text();
        const verifyData = JSON.parse(verifyText);
        console.log('Verification - saved password matches:', verifyData.password === body.password);
      }
    } catch (verifyError) {
      console.error('Error verifying saved password:', verifyError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully in Vercel Blob Storage',
      url: result.url
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error: any) {
    console.error('Error updating password:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل تحديث كلمة المرور' 
    }, { status: 500 });
  }
} 