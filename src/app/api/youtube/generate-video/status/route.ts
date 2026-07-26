import { NextRequest, NextResponse } from 'next/server';
import { isSafeIdentifier } from '@/lib/api-guards.mjs';

const XAI_API_KEY = process.env.XAI_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('request_id');

    if (!requestId || !isSafeIdentifier(requestId)) {
      return NextResponse.json({ error: 'Invalid request_id' }, { status: 400 });
    }

    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'XAI_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.x.ai/v1/videos/generations/${encodeURIComponent(requestId)}`, {
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Video provider request failed' }, { status: 502 });
    }

    const data = await response.json();

    return NextResponse.json({
      request_id: requestId,
      status: data.status,
      video_url: data.video_url || null,
      progress: data.progress || null,
    });
  } catch (error) {
    console.error('Video status error:', error);
    return NextResponse.json({ error: 'Failed to check video status' }, { status: 500 });
  }
}
