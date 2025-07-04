import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'لم يتم إرسال أي ملف' }, { status: 400 });
  }
  // يمكنك تغيير المسار حسب نوع الملف (مثلاً: images/ أو videos/ أو data/)
  const { url } = await put(`uploads/${file.name}`, file, { access: 'public' });
  return NextResponse.json({ url });
} 