import { NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'products/products.json' });
    if (!blobs || blobs.length === 0) return NextResponse.json([]);
    const url = blobs[0].url;
    const products = await fetch(url).then(res => res.json());
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json([]);
  }
} 