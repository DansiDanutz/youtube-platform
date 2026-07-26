import { NextRequest, NextResponse } from 'next/server'
import { getVoicesForLanguage, type VoiceoverConfig } from '@/lib/voices'
import {
  isBoundedJsonValue,
  isBoundedText,
  isFiniteNumberInRange,
  normalizeVoiceoverControls,
} from '@/lib/api-guards.mjs'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { text, config } = await request.json() as {
      text: string
      config: VoiceoverConfig
    }

    const controls = normalizeVoiceoverControls(config)
    const validConfig = isBoundedJsonValue(config, 4_096)
      && isBoundedText(config?.languageCode, 32)
      && isBoundedText(config?.voiceId, 64)
      && isFiniteNumberInRange(controls.speed, 0.25, 4)
      && isFiniteNumberInRange(controls.pitch, -10, 10)
      && isFiniteNumberInRange(controls.volume, 0, 1)

    if (!isBoundedText(text, 4_000) || !validConfig) {
      return NextResponse.json({ error: 'Invalid or oversized voiceover request' }, { status: 400 })
    }

    // Determine voice preset
    const voices = getVoicesForLanguage(config.languageCode)
    const preset = voices.find(v => v.id === config.voiceId) ?? voices[0]

    if (!preset) {
      return NextResponse.json(
        { error: `No voices available for language: ${config.languageCode}` },
        { status: 400 }
      )
    }

    // ── Try ElevenLabs first ─────────────────────────────────────────────────
    if (ELEVENLABS_API_KEY && preset.elevenLabsId) {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${preset.elevenLabsId}/stream`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true,
            },
          }),
          signal: AbortSignal.timeout(30_000),
        }
      )

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer()
        return new Response(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'X-Provider': 'elevenlabs',
            'X-Voice': preset.name,
            'X-Language': config.languageCode,
          },
        })
      }
    }

    // ── Try OpenAI TTS ───────────────────────────────────────────────────────
    if (OPENAI_API_KEY && preset.openAiVoice) {
      const speedClamped = Math.min(4.0, Math.max(0.25, controls.speed))

      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: preset.openAiVoice,
          speed: speedClamped,
          response_format: 'mp3',
        }),
        signal: AbortSignal.timeout(30_000),
      })

      if (res.ok) {
        const audioBuffer = await res.arrayBuffer()
        return new Response(audioBuffer, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'X-Provider': 'openai',
            'X-Voice': preset.openAiVoice,
            'X-Language': config.languageCode,
          },
        })
      }
    }

    // ── Fallback: return config for browser Web Speech API ──────────────────
    return NextResponse.json({
      provider: 'web-speech',
      text,
      languageCode: config.languageCode,
      voiceHint: preset.webSpeechHint ?? null,
      speed: controls.speed,
      pitch: controls.pitch,
      volume: controls.volume,
      message: 'No TTS API keys configured — use browser Web Speech API',
    })
  } catch (error) {
    console.error('Voiceover error:', error)
    return NextResponse.json({ error: 'Failed to generate voiceover' }, { status: 500 })
  }
}
