import { NextRequest, NextResponse } from "next/server";
import { list } from '@vercel/blob';

const PASSWORD_BLOB_KEY = "dashboard-password.json";

// دالة تشفير بسيطة لكلمة المرور
function encryptPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

// دالة فك التشفير المحسنة
function decryptPassword(encrypted: string): string {
  try {
    if (!encrypted || encrypted.length < 4) {
      return encrypted;
    }
    
    const decrypted = Buffer.from(encrypted, 'base64').toString('utf-8');
    
    if (!decrypted || decrypted.length === 0) {
      return encrypted;
    }
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting password:', error);
    return encrypted;
  }
}

export async function GET() {
  try {
    console.log('=== GET /api/debug-password ===');
    
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
        error: 'Password file not found',
        availableFiles: blobs.map(b => b.pathname)
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
        error: 'Failed to read password file',
        status: response.status,
        statusText: response.statusText
      }, { status: 500 });
    }
    
    const text = await response.text();
    console.log('Raw password file content:', text);
    
    let passwordData;
    try {
      passwordData = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json({
        error: 'Invalid JSON in password file',
        rawContent: text,
        parseError: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 500 });
    }
    
    console.log('Password data:', passwordData);
    
    // استخراج كلمة المرور
    const encryptedPassword = passwordData.password || passwordData.dashboardPassword || "";
    console.log('Encrypted password:', encryptedPassword);
    
    // فك تشفير كلمة المرور
    const decryptedPassword = decryptPassword(encryptedPassword);
    console.log('Decrypted password:', decryptedPassword);
    
    // اختبار تشفير كلمة المرور الجديدة
    const testPassword = "israa@2025";
    const testEncrypted = encryptPassword(testPassword);
    const testDecrypted = decryptPassword(testEncrypted);
    
    // اختبار كلمات مرور بديلة
    const alternativePasswords = [
      "israa2025",
      "israa_2025", 
      "israa123",
      "admin123"
    ];
    
    const alternativeTests = alternativePasswords.map(pwd => ({
      password: pwd,
      encrypted: encryptPassword(pwd),
      decrypted: decryptPassword(encryptPassword(pwd)),
      works: pwd === decryptPassword(encryptPassword(pwd))
    }));
    
    // التحقق من حالة التشفير
    const isEncrypted = encryptedPassword !== decryptedPassword;
    const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(encryptedPassword);
    
    // فحص مشكلة الرمز @
    const hasSpecialChar = testPassword.includes('@');
    const specialCharTest = {
      original: testPassword,
      hasSpecialChar,
      encrypted: testEncrypted,
      decrypted: testDecrypted,
      works: testPassword === testDecrypted,
      length: testPassword.length,
      charCodes: testPassword.split('').map(char => char.charCodeAt(0))
    };
    
    return NextResponse.json({
      success: true,
      debug: {
        // معلومات الملف
        blobUrl: passwordBlob.url,
        fileSize: text.length,
        lastModified: passwordBlob.uploadedAt,
        
        // محتوى الملف
        rawContent: text,
        parsedData: passwordData,
        
        // كلمة المرور الحالية
        encryptedPassword,
        decryptedPassword,
        isEncrypted,
        isBase64,
        passwordLength: decryptedPassword.length,
        
        // اختبار كلمة المرور الجديدة
        testPassword,
        testEncrypted,
        testDecrypted,
        testEncryptionWorks: testPassword === testDecrypted,
        
        // مقارنة
        passwordsMatch: decryptedPassword === testPassword,
        encryptionTest: {
          original: testPassword,
          encrypted: testEncrypted,
          decrypted: testDecrypted,
          success: testPassword === testDecrypted
        },
        
        // اختبار كلمات مرور بديلة
        alternativeTests,
        
        // فحص مشكلة الرمز @
        specialCharTest
      },
      message: "Password debug completed successfully"
    });
    
  } catch (error: any) {
    console.error('Error debugging password:', error);
    return NextResponse.json({
      error: error.message || 'فشل تشخيص كلمة المرور',
      stack: error.stack
    }, { status: 500 });
  }
} 