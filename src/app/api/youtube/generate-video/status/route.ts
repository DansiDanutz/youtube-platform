import { NextRequest, NextResponse } from 'next/server';

const XAI_API_KEY = process.env.XAI_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('request_id');

    if (!requestId) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 });
    }

    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'XAI_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch(`https://api.x.ai/v1/videos/generations/${requestId}`, {
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `XAI API error: ${error}` }, { status: response.status });
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
