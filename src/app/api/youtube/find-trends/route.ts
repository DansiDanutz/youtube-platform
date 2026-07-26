import { NextRequest, NextResponse } from 'next/server';
import { callAI, parseJSON } from '@/lib/ai-client';
import { isBoundedText } from '@/lib/api-guards.mjs';

export async function POST(request: NextRequest) {
  try {
    const { niche }: { niche: string } = await request.json();

    if (!isBoundedText(niche, 120)) {
      return NextResponse.json({ error: 'Niche must contain 1-120 characters' }, { status: 400 });
    }

    const aiResult = await callAI([
      {
        role: 'system',
        content: 'You are a YouTube trend analyst. Return only a JSON array of strings.',
      },
      {
        role: 'user',
        content: `Generate 10 trending YouTube topics for the "${niche}" niche that are likely to get high views right now. Focus on recent developments, controversial angles, how-to demand, and curiosity-gap hooks. Return only a JSON array of 10 topic strings.`,
      },
    ]);

    if (aiResult) {
      const trends = parseJSON<string[]>(aiResult.text);
      if (Array.isArray(trends) && trends.length > 0) {
        return NextResponse.json({ trends: trends.slice(0, 10), _provider: aiResult.provider });
      }
    }

    return NextResponse.json({ trends: generateMockTrends(niche) });
  } catch (error) {
    console.error('Trend detection error:', error);
    return NextResponse.json({ error: 'Failed to detect trends' }, { status: 500 });
  }
}

function generateMockTrends(niche: string): string[] {
  const nicheSpecific: Record<string, string[]> = {
    tech: ['AI tools that will replace your job', 'iPhone vs Pixel — brutal comparison', 'Why everyone is switching to Linux', 'The crypto comeback nobody saw coming', 'Tesla bot vs Boston Dynamics'],
    fitness: ['Why cardio is actually killing your gains', 'The protein powder industry exposed', '75 Hard challenge — I tried it for you', 'Gym etiquette rules everyone ignores', 'Why Planet Fitness kicked me out'],
    gaming: ['The gaming industry is dying — here\'s why', 'Why mobile gaming is taking over', 'Games that aged terribly', 'The most overhyped game of 2025', 'Speedrun world records never beaten'],
    cooking: ['Gordon Ramsay recipes I tried to recreate', 'Why restaurant food tastes better', 'Kitchen gadgets that are total scams', 'Expensive vs cheap ingredients — the truth', 'Cooking mistakes that ruin everything'],
    education: ['Skills schools should teach but don\'t', 'Why the education system is broken', 'Learning methods that actually work', 'College degrees that are worthless now', 'The future of online learning'],
  };

  const base = [
    `Why ${niche} experts hate this one simple trick`,
    `The ${niche} mistake 99% of people make`,
    `I tried ${niche} for 30 days — here's what happened`,
    `${niche} trends that will dominate 2025`,
    `The truth about ${niche} that no one talks about`,
    `How to master ${niche} in 30 days (proven method)`,
    `${niche} myths that are totally wrong`,
    `The future of ${niche} is here`,
    `${niche} secrets from industry insiders`,
    `Why everyone is obsessed with ${niche} right now`,
  ];

  const specific = nicheSpecific[niche.toLowerCase()] ?? [];
  return [...specific, ...base].slice(0, 10);
}
