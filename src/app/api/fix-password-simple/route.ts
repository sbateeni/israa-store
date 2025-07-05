import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

// دالة تشفير بسيطة لكلمة المرور
function encryptPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== POST /api/fix-password-simple ===');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }
    
    const body = await req.json();
    const newPassword = body.password || "israa2025"; // كلمة مرور بسيطة بدون رموز خاصة
    
    console.log('Setting simple password:', newPassword);
    
    // إنشاء كلمة المرور البسيطة مع التشفير
    const encryptedPassword = encryptPassword(newPassword);
    const passwordData = { password: encryptedPassword };
    const passwordBlob = new Blob([JSON.stringify(passwordData, null, 2)], { type: "application/json" });
    
    const result = await put(PASSWORD_BLOB_KEY, passwordBlob, { 
      access: 'public', 
      token,
      allowOverwrite: true 
    });
    
    console.log('Simple password saved successfully:', result.url);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم تعيين كلمة مرور بسيطة بنجاح',
      password: newPassword,
      encryptedPassword: encryptedPassword,
      url: result.url,
      note: "كلمة المرور الجديدة: " + newPassword
    });
    
  } catch (error: any) {
    console.error('Error setting simple password:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل تعيين كلمة المرور البسيطة' 
    }, { status: 500 });
  }
} 