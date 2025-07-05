import { NextRequest, NextResponse } from "next/server";
import { put, list } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

// دالة تشفير بسيطة لكلمة المرور
function encryptPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== POST /api/encrypt-current-password ===');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }
    
    // جلب الملف الحالي من Blob Storage
    const { blobs } = await list();
    const passwordBlob = blobs.find(blob => blob.pathname === PASSWORD_BLOB_KEY);
    
    if (!passwordBlob) {
      return NextResponse.json({ 
        error: 'Password file not found' 
      }, { status: 404 });
    }
    
    // قراءة المحتوى الحالي
    const response = await fetch(passwordBlob.url);
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to read current password file' 
      }, { status: 500 });
    }
    
    const currentContent = await response.text();
    console.log('Current password file content:', currentContent);
    
    const currentData = JSON.parse(currentContent);
    const currentPassword = currentData.password || currentData.dashboardPassword || "israa2025";
    
    console.log('Current password:', currentPassword);
    
    // تشفير كلمة المرور الحالية
    const encryptedPassword = encryptPassword(currentPassword);
    const newPasswordData = { password: encryptedPassword };
    
    console.log('Encrypted password data:', newPasswordData);
    
    // حفظ كلمة المرور المشفرة
    const passwordBlobNew = new Blob([JSON.stringify(newPasswordData, null, 2)], { type: "application/json" });
    
    const result = await put(PASSWORD_BLOB_KEY, passwordBlobNew, { 
      access: 'public', 
      token,
      allowOverwrite: true 
    });
    
    console.log('Password encrypted and saved successfully:', result.url);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Current password encrypted successfully',
      originalPassword: currentPassword,
      encryptedPassword: encryptedPassword,
      url: result.url
    });
    
  } catch (error: any) {
    console.error('Error encrypting current password:', error);
    return NextResponse.json({ 
      error: error.message || 'فشل تشفير كلمة المرور الحالية' 
    }, { status: 500 });
  }
} 