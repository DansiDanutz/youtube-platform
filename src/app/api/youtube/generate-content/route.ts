import { NextRequest, NextResponse } from 'next/server';
import { VideoTemplate, GeneratedContent } from '@/lib/types';

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

    // Construct the AI prompt
    const prompt = `Generate YouTube content for the "${template.name}" format about "${topic}"${niche ? ` in the ${niche} niche` : ''}.

Template Structure: ${template.structure.join(' → ')}
Example Hooks: ${template.hooks.join(', ')}

Generate:
1. A compelling YouTube title (under 60 characters)
2. An engaging hook (first 15 seconds of video)
3. A detailed description (2-3 paragraphs)
4. 10 relevant tags
5. A full script following the template structure
6. A strong call-to-action

Make it viral, engaging, and optimized for the YouTube algorithm.`;

    let content: GeneratedContent;

    // Try XAI Grok first, then OpenAI, fallback to mock
    const apiKey = process.env.XAI_API_KEY || process.env.OPENAI_API_KEY;
    const apiUrl = process.env.XAI_API_KEY 
      ? 'https://api.x.ai/v1/chat/completions' 
      : 'https://api.openai.com/v1/chat/completions';
    const model = process.env.XAI_API_KEY ? 'grok-3-mini-fast' : 'gpt-4';

    if (apiKey) {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a YouTube content creation expert. Generate engaging, viral content that follows proven formats. Return only a JSON object with the requested fields.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        try {
          content = JSON.parse(data.choices[0].message.content);
        } catch (parseError) {
          // If JSON parsing fails, create structured content from the response
          const text = data.choices[0].message.content;
          content = parseContentFromText(text, template, topic, niche);
        }
      } else {
        content = generateMockContent(template, topic, niche);
      }
    } else {
      content = generateMockContent(template, topic, niche);
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}

function generateMockContent(template: VideoTemplate, topic: string, niche: string): GeneratedContent {
  const nicheText = niche ? ` ${niche}` : '';
  
  return {
    title: `${template.example_title.replace(/[A-Z][^:]*/, topic)} - You Won't Believe This!`,
    description: `In this ${template.name.toLowerCase()}, I'm diving deep into ${topic}${nicheText}. ${template.description} This video will completely change how you think about ${topic}!\n\n🔥 What you'll discover:\n• The truth about ${topic}\n• Proven strategies that actually work\n• My personal experience and results\n\n💡 Don't forget to LIKE this video if it helped you, SUBSCRIBE for more${nicheText} content, and ring that notification bell so you never miss my latest uploads!\n\n#${topic.replace(/\s+/g, '')} #YouTube${niche ? ` #${niche.replace(/\s+/g, '')}` : ''}`,
    tags: [
      topic.toLowerCase(),
      template.category,
      niche?.toLowerCase() || 'lifestyle',
      'tutorial',
      'tips',
      'guide',
      'how to',
      'explained',
      'review',
      'viral'
    ],
    hook: template.hooks[Math.floor(Math.random() * template.hooks.length)].replace(/this|This/, topic),
    script: generateScript(template, topic, niche),
    cta: `If this video helped you understand ${topic} better, smash that LIKE button and SUBSCRIBE for more content like this!`
  };
}

function generateScript(template: VideoTemplate, topic: string, niche: string): string {
  const nicheText = niche ? ` in ${niche}` : '';
  
  return `[HOOK - 0:00-0:15]
${template.hooks[0].replace(/this|This/, topic)}

[INTRO - 0:15-0:30]
What's up everyone! Today we're talking about ${topic}${nicheText}, and I promise this video will change everything you thought you knew about this topic.

[MAIN CONTENT - 0:30-8:00]
${template.structure.slice(2, -2).map((section, idx) => 
  `[${section.toUpperCase()} - ${Math.floor(0.5 + idx * 2)}:${30 + idx * 15}-${Math.floor(2.5 + idx * 2)}:${45 + idx * 15}]
Let me break down ${section.toLowerCase()} for you...

This is where we dive deep into the specifics of ${topic}. Based on my research and experience${nicheText}, here's what you need to know...`
).join('\n\n')}

[CTA - 8:00-8:30]
If you found this helpful, make sure to LIKE this video, SUBSCRIBE to the channel, and hit that notification bell. What's your experience with ${topic}? Let me know in the comments below!

[OUTRO - 8:30-9:00]
Thanks for watching, and I'll see you in the next one!`;
}

function parseContentFromText(text: string, template: VideoTemplate, topic: string, niche: string): GeneratedContent {
  // Basic parsing logic for non-JSON responses
  const lines = text.split('\n').filter(line => line.trim());
  
  return {
    title: extractSection(lines, 'title') || `${topic}: ${template.example_title}`,
    description: extractSection(lines, 'description') || `Learn about ${topic} in this ${template.name.toLowerCase()}.`,
    tags: extractTags(text) || [topic, template.category, niche].filter(Boolean),
    hook: extractSection(lines, 'hook') || template.hooks[0],
    script: extractSection(lines, 'script') || generateScript(template, topic, niche),
    cta: extractSection(lines, 'cta') || `Like and subscribe for more ${topic} content!`
  };
}

function extractSection(lines: string[], section: string): string | null {
  const sectionIndex = lines.findIndex(line => 
    line.toLowerCase().includes(section.toLowerCase())
  );
  
  if (sectionIndex === -1) return null;
  
  const nextSectionIndex = lines.findIndex((line, idx) => 
    idx > sectionIndex && line.match(/^\d+\.|^[A-Z]/));
  
  const endIndex = nextSectionIndex === -1 ? lines.length : nextSectionIndex;
  
  return lines.slice(sectionIndex + 1, endIndex).join(' ').trim();
}

function extractTags(text: string): string[] {
  const tagMatches = text.match(/#[\w]+/g);
  return tagMatches ? tagMatches.map(tag => tag.substring(1)) : [];
}