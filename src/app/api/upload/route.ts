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
    if (key === 'products.json') {
      putOptions.allowOverwrite = true;
    }
    const { url } = await put(key, file, putOptions);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'فشل رفع الملف' }, { status: 500 });
  }
} 