import { NextRequest, NextResponse } from 'next/server';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export async function GET(req: NextRequest) {
  return NextResponse.json({
    tokenExists: !!BLOB_TOKEN,
    tokenPreview: BLOB_TOKEN ? BLOB_TOKEN.substring(0, 20) + '...' : 'NO TOKEN',
    message: 'Test endpoint working'
  });
} 