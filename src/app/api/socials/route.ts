import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

const SOCIALS_KEY = 'socials';

// يجب إضافة هذه المتغيرات في إعدادات Vercel
const EDGE_CONFIG_ID = process.env.EDGE_CONFIG_ID;
const EDGE_CONFIG_TOKEN = process.env.EDGE_CONFIG_TOKEN;

export async function GET() {
  const socials = await get(SOCIALS_KEY);
  return NextResponse.json(socials || { facebook: '', instagram: '', snapchat: '', whatsapp: '' });
}

export async function POST(req: NextRequest) {
  if (!EDGE_CONFIG_ID || !EDGE_CONFIG_TOKEN) {
    return NextResponse.json({ error: 'لم يتم ضبط متغيرات البيئة المطلوبة' }, { status: 500 });
  }
  const data = await req.json();
  const res = await fetch(`https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${EDGE_CONFIG_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: [{ operation: 'upsert', key: SOCIALS_KEY, value: data }] })
  });
  if (res.ok) {
    return NextResponse.json({ success: true });
  } else {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }
} 