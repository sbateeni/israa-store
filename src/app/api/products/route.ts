import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

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

export async function POST(req: NextRequest) {
  console.log('API Products: Starting POST request...');
  
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('API Products: Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }

    const productData = await req.json();
    console.log('API Products: Received product data:', productData);

    // التحقق من البيانات المطلوبة
    if (!productData.name || !productData.description || !productData.price || !productData.category) {
      console.error('API Products: Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields: name, description, price, category' 
      }, { status: 400 });
    }

    // جلب المنتجات الحالية
    const { blobs } = await list();
    const productsBlob = blobs.find(blob => blob.pathname === PRODUCTS_BLOB_KEY);
    
    let existingProducts = [];
    
    if (productsBlob) {
      try {
        const response = await fetch(productsBlob.url);
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
              existingProducts = data;
            }
          }
        }
      } catch (error) {
        console.log('API Products: Error reading existing products, starting fresh:', error);
      }
    }

    // إنشاء منتج جديد
    const newProduct = {
      id: Date.now().toString(), // ID بسيط
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      category: productData.category,
      image: productData.image || '',
      whatsapp: productData.whatsapp || '',
      facebook: productData.facebook || '',
      instagram: productData.instagram || '',
      snapchat: productData.snapchat || '',
      createdAt: new Date().toISOString()
    };

    console.log('API Products: New product created:', newProduct);

    // إضافة المنتج الجديد إلى القائمة
    const updatedProducts = [...existingProducts, newProduct];

    // حفظ القائمة المحدثة
    const productsJson = JSON.stringify(updatedProducts, null, 2);
    const blob = new Blob([productsJson], { type: 'application/json' });

    console.log('API Products: Saving updated products to blob...');
    
    const { url } = await put(PRODUCTS_BLOB_KEY, blob, {
      access: 'public',
      token,
      allowOverwrite: true
    });

    console.log('API Products: Products saved successfully:', url);

    return NextResponse.json({ 
      success: true, 
      product: newProduct,
      message: 'Product added successfully'
    });

  } catch (error: any) {
    console.error('API Products: Error in POST request:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to add product',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log('API Products: Starting DELETE request...');
  
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('API Products: Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id');
    
    if (!productId) {
      console.error('API Products: Missing product ID');
      return NextResponse.json({ 
        error: 'Missing product ID' 
      }, { status: 400 });
    }

    console.log('API Products: Deleting product with ID:', productId);

    // جلب المنتجات الحالية
    const { blobs } = await list();
    const productsBlob = blobs.find(blob => blob.pathname === PRODUCTS_BLOB_KEY);
    
    let existingProducts = [];
    
    if (productsBlob) {
      try {
        const response = await fetch(productsBlob.url);
        if (response.ok) {
          const text = await response.text();
          if (text) {
            const data = JSON.parse(text);
            if (Array.isArray(data)) {
              existingProducts = data;
            }
          }
        }
      } catch (error) {
        console.log('API Products: Error reading existing products:', error);
        return NextResponse.json({ 
          error: 'Failed to read existing products' 
        }, { status: 500 });
      }
    }

    // حذف المنتج
    const updatedProducts = existingProducts.filter(product => product.id !== productId);
    
    if (updatedProducts.length === existingProducts.length) {
      console.log('API Products: Product not found for deletion');
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }

    // حفظ القائمة المحدثة
    const productsJson = JSON.stringify(updatedProducts, null, 2);
    const blob = new Blob([productsJson], { type: 'application/json' });

    console.log('API Products: Saving updated products after deletion...');
    
    const { url } = await put(PRODUCTS_BLOB_KEY, blob, {
      access: 'public',
      token,
      allowOverwrite: true
    });

    console.log('API Products: Product deleted successfully:', url);

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error: any) {
    console.error('API Products: Error in DELETE request:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete product',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 