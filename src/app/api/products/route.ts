import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

const PRODUCTS_BLOB_KEY = "products.json";

export async function GET(req: NextRequest) {
  console.log('API Products: Starting fetch...');
  
  try {
    console.log('API Products: Fetching from Vercel Blob...');
    const { blobs } = await list();
    
    // ابحث عن ملف products.json
    const productsBlob = blobs.find(blob => blob.pathname === PRODUCTS_BLOB_KEY);
    
    if (!productsBlob) {
      console.log('API Products: File not found, returning empty array');
      return NextResponse.json([]);
    }
    
    // جلب محتوى الملف
    const response = await fetch(productsBlob.url);
    const text = await response.text();
    const data = JSON.parse(text);
    console.log('API Products: Data received:', data);
    return NextResponse.json(data || []);
    
  } catch (error: any) {
    console.log('API Products: Error fetching file:', error.message);
    console.log('API Products: Full error:', error);
    return NextResponse.json([]);
  }
} 