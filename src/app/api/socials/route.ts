import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export async function GET() {
  const socials = await get('socials');
  return NextResponse.json(socials);
} 