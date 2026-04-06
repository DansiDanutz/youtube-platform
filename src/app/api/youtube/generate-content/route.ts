import { NextRequest, NextResponse } from 'next/server';
import { VideoTemplate, GeneratedContent } from '@/lib/types';
import { callAI, parseJSON } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const { template, topic, niche }: {
      template: VideoTemplate;
      topic: string;
      niche: string;
    } = await request.json();

    if (!template || !topic) {
      return NextResponse.json({ error: 'Template and topic are required' }, { status: 400 });
    }

    const prompt = `Generate YouTube content for the "${template.name}" format about "${topic}"${niche ? ` in the ${niche} niche` : ''}.

Template Structure: ${template.structure.join(' → ')}
Example Hooks: ${template.hooks.join(', ')}

Return a JSON object with exactly these fields:
{
  "title": string (under 60 chars, compelling),
  "hook": string (first 15 seconds, grabs attention),
  "description": string (2-3 paragraphs, SEO-optimized),
  "tags": string[] (10 relevant tags),
  "script": string (full script following template structure),
  "cta": string (strong call-to-action)
}

Make it viral, algorithm-optimized, and high-CTR. Return only valid JSON.`;

    const aiResult = await callAI([
      {
        role: 'system',
        content: 'You are a YouTube content creation expert. Generate engaging, viral content that follows proven formats. Return only valid JSON.',
      },
      { role: 'user', content: prompt },
    ]);

    if (aiResult) {
      const content = parseJSON<GeneratedContent>(aiResult.text);
      if (content && content.title && content.script) {
        return NextResponse.json({ ...content, _provider: aiResult.provider, _model: aiResult.model });
      }
    }

    // Fallback to mock content
    return NextResponse.json(generateMockContent(template, topic, niche));
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}

function generateMockContent(template: VideoTemplate, topic: string, niche: string): GeneratedContent {
  const nicheText = niche ? ` ${niche}` : '';
  return {
    title: `${topic}: ${template.example_title}`.substring(0, 60),
    description: `In this ${template.name.toLowerCase()}, I'm diving deep into ${topic}${nicheText}. ${template.description} This video will completely change how you think about ${topic}!\n\n🔥 What you'll discover:\n• The truth about ${topic}\n• Proven strategies that actually work\n• My personal experience and results\n\n💡 Don't forget to LIKE, SUBSCRIBE, and hit the notification bell!`,
    tags: [topic.toLowerCase(), template.category, niche?.toLowerCase() || 'lifestyle', 'tutorial', 'tips', 'guide', 'how to', 'explained', 'review', 'viral'],
    hook: template.hooks[0].replace(/this|This/, topic),
    script: generateScript(template, topic, niche),
    cta: `If this video helped you understand ${topic}, smash that LIKE button and SUBSCRIBE!`,
  };
}

function generateScript(template: VideoTemplate, topic: string, niche: string): string {
  const nicheText = niche ? ` in ${niche}` : '';
  return `[HOOK - 0:00-0:15]
${template.hooks[0].replace(/this|This/, topic)}

[INTRO - 0:15-0:30]
What's up everyone! Today we're talking about ${topic}${nicheText}.

[MAIN CONTENT - 0:30-8:00]
${template.structure.slice(2, -2).map((section, idx) =>
  `[${section.toUpperCase()} - ${Math.floor(0.5 + idx * 2)}:30]
Let me break down ${section.toLowerCase()} for you regarding ${topic}...`
).join('\n\n')}

[CTA - 8:00-8:30]
If you found this helpful, LIKE, SUBSCRIBE, and hit the notification bell!

[OUTRO - 8:30-9:00]
Thanks for watching — see you in the next one!`;
}
