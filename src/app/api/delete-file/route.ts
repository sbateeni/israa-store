import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function DELETE(req: NextRequest) {
  const { pathname } = await req.json();
  if (!pathname) {
    return NextResponse.json({ error: 'يجب إرسال اسم الملف (pathname)' }, { status: 400 });
  }
  await del(pathname);
  return NextResponse.json({ success: true });
} 