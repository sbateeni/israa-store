import { NextRequest, NextResponse } from "next/server";
import { put, list } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

export async function GET() {
  try {
    console.log('=== GET /api/dashboard-password ===');
    console.log('Fetching dashboard password from Vercel Blob Storage...');
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({
        password: "israa2025", // كلمة المرور الافتراضية
        message: "Using default password - BLOB_READ_WRITE_TOKEN not configured"
      }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
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
            return NextResponse.json({
              password: passwordData.password,
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
      const defaultPassword = { password: "israa2025" };
      const passwordBlob = new Blob([JSON.stringify(defaultPassword, null, 2)], { type: "application/json" });
      
      try {
        await put(PASSWORD_BLOB_KEY, passwordBlob, { 
          access: 'public', 
          token,
          allowOverwrite: true 
        });
        console.log('Default password created in blob storage');
        return NextResponse.json({
          password: defaultPassword.password,
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
          password: "israa2025",
          message: "Using fallback password"
        }, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
    }
    
    return NextResponse.json({
      password: "israa2025",
      message: "Using fallback password"
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error("Error fetching password:", error);
    return NextResponse.json({
      password: "israa2025",
      message: "Error occurred, using fallback password"
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== POST /api/dashboard-password ===');
    const body = await req.json();
    console.log('Received password update request:', { newPassword: body.password ? '***' : 'undefined' });
    
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }
    
    if (!body.password) {
      console.error('Password is required');
      return NextResponse.json({ 
        error: 'Password is required' 
      }, { status: 400 });
    }
    
    // إنشاء كلمة المرور الجديدة
    const passwordData = { password: body.password };
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