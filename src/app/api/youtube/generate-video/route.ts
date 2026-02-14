import { NextRequest, NextResponse } from 'next/server';

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_VIDEO_URL = 'https://api.x.ai/v1/videos/generations';

export async function POST(request: NextRequest) {
  try {
    const { prompt, image_url, duration, aspect_ratio } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!XAI_API_KEY) {
      return NextResponse.json({ error: 'XAI_API_KEY not configured' }, { status: 500 });
    }

    const body: Record<string, unknown> = {
      model: 'grok-imagine-video',
      prompt,
      duration: duration || 10,
      aspect_ratio: aspect_ratio || '16:9',
      resolution: '720p',
    };

    // Image-to-video if image provided
    if (image_url) {
      body.image_url = image_url;
    }

    const response = await fetch(XAI_VIDEO_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `XAI API error: ${error}` }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      request_id: data.request_id || data.id,
      status: data.status || 'processing',
      video_url: data.video_url || null,
      message: 'Video generation started. Poll /api/youtube/generate-video/status for completion.',
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json({ error: 'Failed to start video generation' }, { status: 500 });
  }
}
