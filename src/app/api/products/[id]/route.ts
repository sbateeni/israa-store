import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

const PRODUCTS_BLOB_KEY = "products.json";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('API Products: Starting PUT request for product:', params.id);
  
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('API Products: Missing BLOB_READ_WRITE_TOKEN');
      return NextResponse.json({ 
        error: 'Missing BLOB_READ_WRITE_TOKEN' 
      }, { status: 500 });
    }

    const productData = await req.json();
    console.log('API Products: Received product update data:', productData);

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
        console.log('API Products: Error reading existing products:', error);
        return NextResponse.json({ 
          error: 'Failed to read existing products' 
        }, { status: 500 });
      }
    }

    // البحث عن المنتج المراد تحديثه
    const productIndex = existingProducts.findIndex(p => p.id === params.id);
    
    if (productIndex === -1) {
      console.error('API Products: Product not found:', params.id);
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 });
    }

    // تحديث المنتج
    const updatedProduct = {
      ...existingProducts[productIndex],
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      category: productData.category,
      image: productData.image || '',
      images: productData.images || undefined,
      whatsapp: productData.whatsapp || '',
      facebook: productData.facebook || '',
      instagram: productData.instagram || '',
      snapchat: productData.snapchat || '',
      updatedAt: new Date().toISOString()
    };

    console.log('API Products: Updated product:', updatedProduct);

    // تحديث المنتج في القائمة
    existingProducts[productIndex] = updatedProduct;

    // حفظ القائمة المحدثة
    const productsJson = JSON.stringify(existingProducts, null, 2);
    const blob = new Blob([productsJson], { type: 'application/json' });

    console.log('API Products: Saving updated products to blob...');
    
    const { url } = await put(PRODUCTS_BLOB_KEY, blob, {
      access: 'public',
      token,
      allowOverwrite: true
    });

    console.log('API Products: Products updated successfully:', url);

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: 'Product updated successfully'
    });

  } catch (error: any) {
    console.error('API Products: Error in PUT request:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update product',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 