import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function GET(req: NextRequest) {
  if (!BLOB_TOKEN) {
    return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 500 });
  }

  try {
    const emptyProducts: any[] = [];
    const blob = new Blob([JSON.stringify(emptyProducts)], { type: "application/json" });
    const { url } = await put("products.json", blob, { 
      access: "public", 
      token: BLOB_TOKEN,
      allowOverwrite: true 
    });
    
    return NextResponse.json({ 
      success: true, 
      url,
      message: 'products.json created/updated successfully' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to create products.json' 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
} 