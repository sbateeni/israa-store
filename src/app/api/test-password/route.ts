import { NextRequest, NextResponse } from "next/server";
import { list } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

// دالة فك التشفير المحسنة
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

export async function GET() {
  try {
    console.log('=== GET /api/test-password ===');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({
        error: 'Missing BLOB_READ_WRITE_TOKEN'
      }, { status: 500 });
    }
    
    // جلب جميع الملفات من Blob Storage
    const { blobs } = await list();
    console.log('Available blobs:', blobs.map(b => b.pathname));
    
    // البحث عن ملف كلمة المرور
    const passwordBlob = blobs.find(blob => blob.pathname === PASSWORD_BLOB_KEY);
    
    if (!passwordBlob) {
      return NextResponse.json({
        error: 'Password file not found'
      }, { status: 404 });
    }
    
    // قراءة المحتوى
    const response = await fetch(passwordBlob.url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({
        error: 'Failed to read password file'
      }, { status: 500 });
    }
    
    const text = await response.text();
    console.log('Raw password file content:', text);
    
    const passwordData = JSON.parse(text);
    console.log('Password data:', passwordData);
    
    // استخراج كلمة المرور
    const encryptedPassword = passwordData.password || passwordData.dashboardPassword || "";
    console.log('Encrypted password:', encryptedPassword);
    
    // فك تشفير كلمة المرور
    const decryptedPassword = decryptPassword(encryptedPassword);
    console.log('Decrypted password:', decryptedPassword);
    
    // التحقق من حالة التشفير
    const isEncrypted = encryptedPassword !== decryptedPassword;
    const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(encryptedPassword);
    
    return NextResponse.json({
      success: true,
      data: {
        encryptedPassword,
        decryptedPassword,
        isEncrypted,
        isBase64,
        passwordLength: decryptedPassword.length,
        blobUrl: passwordBlob.url,
        fileSize: text.length
      },
      message: "Password test completed successfully"
    });
    
  } catch (error: any) {
    console.error('Error testing password:', error);
    return NextResponse.json({
      error: error.message || 'فشل اختبار كلمة المرور'
    }, { status: 500 });
  }
} 