import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  // يمكنك تخصيص prefix حسب الحاجة (مثلاً: 'uploads/' أو 'images/')
  const files = await list({ prefix: 'uploads/' });
  // يعيد مصفوفة من الكائنات: { url, pathname, size, uploadedAt }
  return NextResponse.json(files);
} 