import { NextRequest, NextResponse } from "next/server";
import { put } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

// دالة تشفير بسيطة لكلمة المرور
function encryptPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

export async function GET() {
  try {
    console.log('=== GET /api/force-encrypt ===');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }
    
    // تشفير كلمة المرور الحالية مباشرة
    const currentPassword = "israa2026";
    const encryptedPassword = encryptPassword(currentPassword);
    const newPasswordData = { password: encryptedPassword };
    
    console.log('Current password:', currentPassword);
    console.log('Encrypted password:', encryptedPassword);
    console.log('New password data:', newPasswordData);
    
    // حفظ كلمة المرور المشفرة
    const passwordBlob = new Blob([JSON.stringify(newPasswordData, null, 2)], { type: "application/json" });
    
    const result = await put(PASSWORD_BLOB_KEY, passwordBlob, { 
      access: 'public', 
      token,
      allowOverwrite: true 
    });
    
    console.log('Password encrypted and saved successfully:', result.url);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password encrypted successfully',
      originalPassword: currentPassword,
      encryptedPassword: encryptedPassword,
      url: result.url,
      blobUrl: "https://3ryi5trxqmi2rgmd.public.blob.vercel-storage.com/dashboard-password.json"
    });
    
  } catch (error: any) {
    console.error('Error encrypting password:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل تشفير كلمة المرور' 
    }, { status: 500 });
  }
} 