import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const products = await req.json();
    if (!Array.isArray(products)) {
      return NextResponse.json({ error: 'البيانات المرسلة يجب أن تكون مصفوفة منتجات' }, { status: 400 });
    }
    const json = JSON.stringify(products, null, 2);
    const blob = await put('products/products.json', json, {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true
    });
    return NextResponse.json({ success: true, url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: 'فشل تحديث المنتجات', details: String(e) }, { status: 500 });
  }
} 