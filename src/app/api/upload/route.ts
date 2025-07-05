import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

// زيادة حد حجم الطلب لملفات الفيديو الكبيرة
export const maxDuration = 300; // 5 دقائق للرفع

// إعدادات لحجم الطلب - Vercel Functions limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Vercel Functions limit
    },
    responseLimit: false,
  },
};

// حدود Vercel Functions الفعلية
const VERCEL_FUNCTION_LIMIT = 4 * 1024 * 1024; // 4MB - حد Vercel Functions الفعلي

export async function POST(req: NextRequest) {
  console.log('Upload API called');
  
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  console.log('BLOB_READ_WRITE_TOKEN exists:', !!token);
  console.log('Token length:', token?.length || 0);
  
  if (!token) {
    console.error('Missing BLOB_READ_WRITE_TOKEN');
    return NextResponse.json({ 
      error: 'Missing BLOB_READ_WRITE_TOKEN. Please check environment variables.',
      details: 'The BLOB_READ_WRITE_TOKEN environment variable is not set.'
    }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    console.log('FormData parsed successfully');
    
    const file = formData.get('file') as File | null;
    const key = formData.get('key') as string | null;
    
    console.log('File received:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      key: key
    });
    
    if (!file || !key) {
      console.error('Missing file or key:', { file: !!file, key: !!key });
      return NextResponse.json({ 
        error: 'Missing file or key',
        details: `File: ${!!file}, Key: ${!!key}`
      }, { status: 400 });
    }

    // التحقق من حد Vercel Functions أولاً
    if (file.size > VERCEL_FUNCTION_LIMIT) {
      console.error('File exceeds Vercel Function limit:', file.size, 'Max allowed:', VERCEL_FUNCTION_LIMIT);
      return NextResponse.json({ 
        error: `حجم الملف كبير جداً. الحد الأقصى المسموح: ${(VERCEL_FUNCTION_LIMIT / (1024 * 1024)).toFixed(1)}MB`,
        details: `حجم الملف: ${(file.size / (1024 * 1024)).toFixed(1)}MB، الحد الأقصى: ${(VERCEL_FUNCTION_LIMIT / (1024 * 1024)).toFixed(1)}MB`,
        suggestion: 'يرجى ضغط الملف أو استخدام ملف أصغر'
      }, { status: 413 });
    }

    // Validate file size - Vercel Functions limit
    const maxSize = 4 * 1024 * 1024; // 4MB - حد Vercel Functions
    if (file.size > maxSize) {
      console.error('File too large:', file.size, 'Max allowed:', maxSize);
      return NextResponse.json({ 
        error: `حجم الملف كبير جداً. الحد الأقصى: ${maxSize / (1024 * 1024)}MB`,
        details: `حجم الملف: ${(file.size / (1024 * 1024)).toFixed(1)}MB، الحد الأقصى: ${maxSize / (1024 * 1024)}MB`,
        suggestion: 'يرجى ضغط الملف أو استخدام ملف أصغر'
      }, { status: 413 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ 
        error: 'Invalid file type',
        details: `File type: ${file.type}, Allowed: ${validTypes.join(', ')}`
      }, { status: 400 });
    }

    let putOptions: any = { access: 'public', token };
    if (key === 'products.json' || key === 'site-settings.json') {
      putOptions.allowOverwrite = true;
    }
    
    console.log(`Uploading file: ${file.name} (${file.size} bytes) to key: ${key}`);
    console.log('Put options:', { access: putOptions.access, allowOverwrite: putOptions.allowOverwrite });
    
    const { url } = await put(key, file, putOptions);
    
    console.log(`File uploaded successfully: ${url}`);
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Upload error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    
    // Handle specific Vercel Blob errors
    if (err.message?.includes('rate limit') || err.message?.includes('429')) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please wait a moment and try again.',
        retryAfter: 5
      }, { 
        status: 429,
        headers: {
          'Retry-After': '5'
        }
      });
    }
    
    if (err.message?.includes('file too large') || err.message?.includes('FUNCTION_PAYLOAD_TOO_LARGE')) {
      return NextResponse.json({ 
        error: 'حجم الملف كبير جداً. الحد الأقصى المسموح: 4MB',
        details: 'يرجى ضغط الفيديو أو استخدام ملف أصغر',
        suggestion: 'يمكنك استخدام أدوات ضغط الفيديو عبر الإنترنت مثل HandBrake أو Online Video Compressor'
      }, { status: 413 });
    }
    
    if (err.message?.includes('invalid file type')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    // Check for authentication errors
    if (err.message?.includes('unauthorized') || err.message?.includes('401')) {
      return NextResponse.json({ 
        error: 'Authentication failed. Please check your Vercel Blob configuration.',
        details: 'The BLOB_READ_WRITE_TOKEN may be invalid or expired.'
      }, { status: 401 });
    }
    
    // Check for network errors
    if (err.message?.includes('network') || err.message?.includes('fetch')) {
      return NextResponse.json({ 
        error: 'Network error. Please check your internet connection and try again.',
        details: err.message
      }, { status: 503 });
    }
    
    return NextResponse.json({ 
      error: err.message || 'فشل رفع الملف',
      details: process.env.NODE_ENV === 'development' ? err.stack : 'Internal server error',
      errorType: err.name || 'UnknownError'
    }, { status: 500 });
  }
} 