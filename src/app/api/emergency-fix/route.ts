import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

// دالة تشفير بسيطة لكلمة المرور
function encryptPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

export async function GET() {
  try {
    console.log('=== GET /api/emergency-fix ===');
    
    // التحقق من وجود متغير البيئة لكلمة المرور الطوارئ
    if (!process.env.EMERGENCY_PASSWORD) {
      console.error('Missing EMERGENCY_PASSWORD environment variable');
      return NextResponse.json({ 
        error: 'Emergency password not configured. Please set EMERGENCY_PASSWORD in Vercel environment variables.',
        instructions: [
          "1. اذهب إلى لوحة تحكم Vercel",
          "2. اذهب إلى Settings → Environment Variables",
          "3. أضف متغير جديد: EMERGENCY_PASSWORD",
          "4. أدخل كلمة المرور الطوارئ المطلوبة",
          "5. أعد نشر الموقع"
        ]
      }, { status: 500 });
    }
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }
    
    // تعيين كلمة مرور طوارئ بسيطة من متغير البيئة
    const emergencyPassword = process.env.EMERGENCY_PASSWORD || "admin123";
    console.log('Setting emergency password:', emergencyPassword ? '***' : 'undefined');
    
    // إنشاء كلمة المرور مع التشفير
    const encryptedPassword = encryptPassword(emergencyPassword);
    const passwordData = { password: encryptedPassword };
    const passwordBlob = new Blob([JSON.stringify(passwordData, null, 2)], { type: "application/json" });
    
    const result = await put(PASSWORD_BLOB_KEY, passwordBlob, { 
      access: 'public', 
      token,
      allowOverwrite: true 
    });
    
    console.log('Emergency password saved successfully:', result.url);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم حل مشكلة كلمة المرور بنجاح',
      password: emergencyPassword,
      instructions: [
        "1. اذهب إلى صفحة تسجيل الدخول",
        "2. استخدم كلمة المرور: " + emergencyPassword,
        "3. اضغط تسجيل الدخول",
        "4. ستتمكن من الوصول للوحة التحكم"
      ],
      note: "كلمة المرور الجديدة: " + emergencyPassword
    });
    
  } catch (error: any) {
    console.error('Error setting emergency password:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل حل مشكلة كلمة المرور' 
    }, { status: 500 });
  }
} 