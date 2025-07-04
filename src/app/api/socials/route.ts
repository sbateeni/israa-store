import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export async function GET() {
  try {
    const socials = await get('socials');
    if (!socials) {
      return NextResponse.json({ whatsapp: "" });
    }
    return NextResponse.json(socials);
  } catch (e) {
    return NextResponse.json({ whatsapp: "" });
  }
} 