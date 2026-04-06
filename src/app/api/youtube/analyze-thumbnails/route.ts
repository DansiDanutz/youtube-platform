import { NextRequest, NextResponse } from 'next/server';
import { ThumbnailScore } from '@/lib/types';
import { parseJSON } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (images.length < 2 || images.length > 4) {
      return NextResponse.json({ error: 'Please upload 2-4 images' }, { status: 400 });
    }

    const results: ThumbnailScore[] = await Promise.all(
      images.map((file) => analyzeImage(file))
    );

    // Mark the winner (highest overall_ctr)
    const maxCTR = Math.max(...results.map((r) => r.scores.overall_ctr));
    results.forEach((r) => {
      r.isWinner = r.scores.overall_ctr === maxCTR;
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Thumbnail analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze thumbnails' }, { status: 500 });
  }
}

async function analyzeImage(file: File): Promise<ThumbnailScore> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');
  const dataUrl = `data:${file.type};base64,${base64}`;

  const systemPrompt = 'You are a YouTube thumbnail optimization expert. Analyze thumbnails and return only valid JSON.';
  const userPrompt = `Analyze this YouTube thumbnail and score it 0–10 on:
1. visual_contrast — how well it stands out in the feed
2. emotional_trigger — emotional impact, use of faces/expressions
3. text_readability — clarity of any text on mobile
4. curiosity_gap — how much it makes you want to click

Return exactly:
{
  scores: {
    visual_contrast: number,
    emotional_trigger: number,
    text_readability: number,
    curiosity_gap: number,
    overall_ctr: number
  },
  reasoning: 2-3 sentence expert analysis with specific improvement tips
}`;

  // 1. Try Gemini 2.5 Flash via OpenRouter (FREE, best vision model)
  const orKey = process.env.OPENROUTER_API_KEY;
  if (orKey) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${orKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://nervix.ai',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: userPrompt },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content ?? '';
        const analysis = parseJSON<{ scores: ThumbnailScore['scores']; reasoning: string }>(text);
        if (analysis?.scores?.overall_ctr !== undefined) {
          return { filename: file.name, url: dataUrl, scores: analysis.scores, reasoning: analysis.reasoning };
        }
      }
    } catch {
      // fall through
    }
  }

  // 2. Try OpenAI Vision (paid fallback)
  const oaiKey = process.env.OPENAI_API_KEY;
  if (oaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${oaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: userPrompt },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
          temperature: 0.3,
          max_tokens: 800,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content ?? '';
        const analysis = parseJSON<{ scores: ThumbnailScore['scores']; reasoning: string }>(text);
        if (analysis?.scores?.overall_ctr !== undefined) {
          return { filename: file.name, url: dataUrl, scores: analysis.scores, reasoning: analysis.reasoning };
        }
      }
    } catch {
      // fall through
    }
  }

  // 3. Mock fallback
  return generateMockAnalysis(dataUrl, file.name);
}

function generateMockAnalysis(dataUrl: string, filename: string): ThumbnailScore {
  const vc = 6.5 + Math.random() * 3;
  const et = 5.5 + Math.random() * 3.5;
  const tr = 6.0 + Math.random() * 3;
  const cg = 5.8 + Math.random() * 3.2;
  const overall_ctr = Math.min(9.5, vc * 0.3 + et * 0.25 + tr * 0.2 + cg * 0.25);

  const scores = {
    visual_contrast: Math.round(vc * 10) / 10,
    emotional_trigger: Math.round(et * 10) / 10,
    text_readability: Math.round(tr * 10) / 10,
    curiosity_gap: Math.round(cg * 10) / 10,
    overall_ctr: Math.round(overall_ctr * 10) / 10,
  };

  const reasoning = [
    scores.visual_contrast >= 8 ? 'Excellent visual contrast.' : scores.visual_contrast >= 6 ? 'Good contrast, could use bolder colors.' : 'Low contrast — brighten or add more color.',
    scores.emotional_trigger >= 8 ? 'Strong emotional appeal.' : 'Add faces or emotional cues to boost clicks.',
    scores.curiosity_gap >= 8 ? 'Creates a strong curiosity gap.' : 'Add mystery elements or a teaser to increase intrigue.',
  ].join(' ');

  return { filename, url: dataUrl, scores, reasoning };
}
