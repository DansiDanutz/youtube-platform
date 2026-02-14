import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { niche }: { niche: string } = await request.json();

    if (!niche) {
      return NextResponse.json({ error: 'Niche is required' }, { status: 400 });
    }

    let trends: string[] = [];

    // Try OpenAI for trend detection
    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = `Generate 10 trending topics for YouTube in the ${niche} niche that are currently popular and likely to get views. Focus on:
        - Recent developments
        - Popular questions people are asking
        - Controversial or debate-worthy topics
        - "How to" topics that are in demand
        - Seasonal or timely content

        Return only a JSON array of trending topic strings, no additional text.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are a YouTube trend analyst. Generate trending topics that are likely to get high views and engagement.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.9,
            max_tokens: 1000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          try {
            trends = JSON.parse(data.choices[0].message.content);
          } catch (parseError) {
            // If JSON parsing fails, extract trends from text
            const text = data.choices[0].message.content;
            trends = extractTrendsFromText(text, niche);
          }
        }
      } catch (error) {
        console.error('OpenAI trend detection failed:', error);
      }
    }

    // Fallback to mock trending topics if AI fails
    if (trends.length === 0) {
      trends = generateMockTrends(niche);
    }

    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Trend detection error:', error);
    return NextResponse.json({ error: 'Failed to detect trends' }, { status: 500 });
  }
}

function generateMockTrends(niche: string): string[] {
  const trendTemplates = [
    `Why ${niche} experts hate this one simple trick`,
    `The ${niche} mistake 99% of people make`,
    `I tried ${niche} for 30 days - here's what happened`,
    `${niche} trends that will dominate 2024`,
    `The truth about ${niche} that no one talks about`,
    `How to master ${niche} in 30 days (proven method)`,
    `${niche} myths that are totally wrong`,
    `The future of ${niche} is here`,
    `${niche} secrets from industry insiders`,
    `Why everyone is obsessed with ${niche} right now`
  ];

  // Niche-specific trending topics
  const nicheSpecific: { [key: string]: string[] } = {
    tech: [
      'AI tools that will replace your job',
      'iPhone 16 vs Galaxy S24 - brutal comparison',
      'Why everyone is switching to Linux',
      'The crypto comeback nobody saw coming',
      'Tesla bot vs Boston Dynamics - the future'
    ],
    fitness: [
      'Why cardio is actually killing your gains',
      'The protein powder industry exposed',
      '75 Hard challenge - I tried it for you',
      'Gym etiquette rules that everyone ignores',
      'Why planet fitness kicked me out'
    ],
    gaming: [
      'The gaming industry is dying - here\'s why',
      'Why mobile gaming is taking over',
      'Games that aged terribly',
      'The most overhyped game of 2024',
      'Speedrun world records that will never be beaten'
    ],
    cooking: [
      'Gordon Ramsay recipes I tried to recreate',
      'Why restaurant food tastes better',
      'Kitchen gadgets that are total scams',
      'The truth about expensive vs cheap ingredients',
      'Cooking mistakes that ruin everything'
    ],
    education: [
      'Skills schools should teach but don\'t',
      'Why the education system is broken',
      'Learning methods that actually work',
      'College degrees that are worthless now',
      'The future of online learning'
    ]
  };

  const specific = nicheSpecific[niche.toLowerCase()] || [];
  const generic = trendTemplates.slice(0, 10 - specific.length);

  return [...specific, ...generic].slice(0, 10);
}

function extractTrendsFromText(text: string, niche: string): string[] {
  // Extract trends from text response
  const lines = text.split('\n').filter(line => line.trim());
  const trends: string[] = [];

  for (const line of lines) {
    // Look for numbered lists, bullets, or quotes
    const cleaned = line
      .replace(/^\d+\.\s*/, '')
      .replace(/^[-*•]\s*/, '')
      .replace(/^["']\s*/, '')
      .replace(/\s*["']$/, '')
      .trim();

    if (cleaned.length > 10 && cleaned.length < 100) {
      trends.push(cleaned);
    }
  }

  // If we didn't extract enough, supplement with mock trends
  if (trends.length < 5) {
    const mockTrends = generateMockTrends(niche);
    trends.push(...mockTrends.slice(0, 10 - trends.length));
  }

  return trends.slice(0, 10);
}