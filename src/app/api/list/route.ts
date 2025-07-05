import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function GET(req: NextRequest) {
  if (!BLOB_TOKEN) {
    return NextResponse.json({ error: 'Missing BLOB_READ_WRITE_TOKEN' }, { status: 500 });
  }

  try {
    const { blobs } = await list({ token: BLOB_TOKEN });
    
    return NextResponse.json({ 
      success: true, 
      files: blobs.map(blob => ({
        name: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to list files' 
    }, { status: 500 });
  }
} 