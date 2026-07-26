import { NextRequest, NextResponse } from 'next/server'
import { scriptToCaptions, type CaptionLine } from '@/lib/captions'
import { isBoundedText, isFiniteNumberInRange } from '@/lib/api-guards.mjs'

const XAI_API_KEY = process.env.XAI_API_KEY
const XAI_CHAT_URL = 'https://api.x.ai/v1/chat/completions'

export async function POST(request: NextRequest) {
  try {
    const { script, duration, style, maxCharsPerLine } = await request.json() as {
      script: string
      duration: number
      style?: string
      maxCharsPerLine?: number
    }

    const normalizedDuration = duration ?? 60
    const normalizedMaxChars = maxCharsPerLine ?? 42
    if (
      !isBoundedText(script, 20_000)
      || !isFiniteNumberInRange(normalizedDuration, 1, 14_400)
      || !Number.isInteger(normalizedMaxChars)
      || !isFiniteNumberInRange(normalizedMaxChars, 10, 200)
    ) {
      return NextResponse.json({ error: 'Invalid or oversized caption request' }, { status: 400 })
    }

    // If XAI is available, use it to clean/segment the script more naturally
    let processedScript = script
    if (XAI_API_KEY) {
      try {
        const res = await fetch(XAI_CHAT_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${XAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-3-mini',
            messages: [
              {
                role: 'system',
                content: `You are a caption editor. Given a video script, reformat it into natural caption segments.
Rules:
- Each caption segment should be 3-7 words
- Keep natural speech rhythm and pauses
- Preserve all the original words (do not add or remove any content)
- Output ONLY the formatted script with line breaks between each caption segment
- No numbering, no timestamps, no extra text`,
              },
              {
                role: 'user',
                content: script,
              },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          }),
          signal: AbortSignal.timeout(15_000),
        })
        if (res.ok) {
          const data = await res.json() as { choices: Array<{ message: { content: string } }> }
          const segmented = data.choices?.[0]?.message?.content?.trim()
          if (segmented) processedScript = segmented
        }
      } catch {
        // fallback to basic segmentation
      }
    }

    // Convert segmented script to timed caption lines
    const captions: CaptionLine[] = scriptToCaptions(processedScript, normalizedDuration, normalizedMaxChars)

    // Scale timing to fit actual video duration
    if (captions.length > 0 && duration) {
      const lastEnd = captions[captions.length - 1].end
      if (lastEnd > 0 && lastEnd !== duration) {
        const scale = duration / lastEnd
        for (const c of captions) {
          c.start = parseFloat((c.start * scale).toFixed(3))
          c.end = parseFloat((c.end * scale).toFixed(3))
        }
      }
    }

    return NextResponse.json({ captions, count: captions.length })
  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json({ error: 'Failed to generate captions' }, { status: 500 })
  }
}
