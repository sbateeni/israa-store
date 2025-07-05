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
    if (!response.ok) {
      console.log('API Products: Failed to fetch blob content, status:', response.status);
      return NextResponse.json([]);
    }
    
    const text = await response.text();
    if (!text) {
      console.log('API Products: Empty blob content');
      return NextResponse.json([]);
    }
    
    const data = JSON.parse(text);
    console.log('API Products: Data received:', data);
    
    // التحقق من صحة البيانات
    if (!Array.isArray(data)) {
      console.log('API Products: Data is not an array, returning empty array');
      return NextResponse.json([]);
    }
    
    // تنظيف البيانات للتأكد من عدم وجود قيم null
    const cleanedData = data.filter(product => product && typeof product === 'object');
    console.log('API Products: Cleaned data length:', cleanedData.length);
    
    return NextResponse.json(cleanedData);
    
  } catch (error: any) {
    console.log('API Products: Error fetching file:', error.message);
    console.log('API Products: Full error:', error);
    return NextResponse.json([]);
  }
} 