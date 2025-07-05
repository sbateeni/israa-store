import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const key = formData.get('key') as string | null;
  if (!file || !key) {
    return NextResponse.json({ error: 'Missing file or key' }, { status: 400 });
  }

  try {
    let putOptions: any = { access: 'public', token };
    if (key === 'products.json' || key === 'site-settings.json') {
      putOptions.allowOverwrite = true;
    }
    
    console.log(`Uploading file: ${file.name} (${file.size} bytes) to key: ${key}`);
    
    const { url } = await put(key, file, putOptions);
    
    console.log(`File uploaded successfully: ${url}`);
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('Upload error:', err);
    
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
    
    if (err.message?.includes('file too large')) {
      return NextResponse.json({ error: 'File size exceeds limit' }, { status: 413 });
    }
    
    if (err.message?.includes('invalid file type')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: err.message || 'فشل رفع الملف',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
} 