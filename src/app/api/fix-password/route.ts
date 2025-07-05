import { NextRequest, NextResponse } from "next/server";
import { put, list } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

// دالة تشفير بسيطة لكلمة المرور
function encryptPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== POST /api/fix-password ===');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }
    
    const body = await req.json();
    const newPassword = body.password || "israa2025";
    
    console.log('Fixing password format in Blob Storage...');
    
    // إنشاء كلمة المرور بالشكل الصحيح مع التشفير
    const passwordData = { password: encryptPassword(newPassword) };
    const passwordBlob = new Blob([JSON.stringify(passwordData, null, 2)], { type: "application/json" });
    
    const result = await put(PASSWORD_BLOB_KEY, passwordBlob, { 
      access: 'public', 
      token,
      allowOverwrite: true 
    });
    
    console.log('Password format fixed successfully:', result.url);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password format fixed in Vercel Blob Storage',
      url: result.url,
      password: newPassword
    });
    
  } catch (error: any) {
    console.error('Error fixing password format:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل إصلاح تنسيق كلمة المرور' 
    }, { status: 500 });
  }
} 