// Caption & Subtitle Types for Video Platform

export interface CaptionWord {
  word: string
  start: number   // seconds
  end: number     // seconds
  confidence?: number
}

export interface CaptionLine {
  id: number
  text: string
  start: number   // seconds from video start
  end: number     // seconds from video start
  words?: CaptionWord[]
}

export interface CaptionStyle {
  fontFamily: 'inter' | 'roboto' | 'impact' | 'montserrat' | 'playfair'
  fontSize: 'sm' | 'md' | 'lg' | 'xl'
  fontWeight: 'normal' | 'semibold' | 'bold'
  color: string            // hex
  backgroundColor: string  // hex with alpha e.g. '#00000088'
  position: 'bottom' | 'top' | 'center'
  alignment: 'left' | 'center' | 'right'
  animation: 'none' | 'fade' | 'slide-up' | 'typewriter' | 'karaoke'
  outlineColor: string     // text stroke color
  outlineWidth: number     // px
  padding: number          // px
  borderRadius: number     // px
  maxCharsPerLine: number
  wordsPerGroup: number    // for word-by-word highlighting
}

export const CAPTION_STYLE_PRESETS: Record<string, { label: string; style: CaptionStyle }> = {
  standard: {
    label: 'Standard',
    style: {
      fontFamily: 'inter',
      fontSize: 'md',
      fontWeight: 'semibold',
      color: '#FFFFFF',
      backgroundColor: '#00000099',
      position: 'bottom',
      alignment: 'center',
      animation: 'none',
      outlineColor: '#000000',
      outlineWidth: 1,
      padding: 8,
      borderRadius: 4,
      maxCharsPerLine: 42,
      wordsPerGroup: 5,
    },
  },
  viral: {
    label: 'Viral / TikTok',
    style: {
      fontFamily: 'impact',
      fontSize: 'xl',
      fontWeight: 'bold',
      color: '#FFFF00',
      backgroundColor: '#00000000',
      position: 'center',
      alignment: 'center',
      animation: 'karaoke',
      outlineColor: '#000000',
      outlineWidth: 3,
      padding: 6,
      borderRadius: 0,
      maxCharsPerLine: 20,
      wordsPerGroup: 3,
    },
  },
  minimal: {
    label: 'Minimal',
    style: {
      fontFamily: 'montserrat',
      fontSize: 'md',
      fontWeight: 'normal',
      color: '#FFFFFF',
      backgroundColor: '#00000000',
      position: 'bottom',
      alignment: 'center',
      animation: 'fade',
      outlineColor: '#000000',
      outlineWidth: 2,
      padding: 4,
      borderRadius: 0,
      maxCharsPerLine: 50,
      wordsPerGroup: 6,
    },
  },
  netflix: {
    label: 'Netflix Style',
    style: {
      fontFamily: 'roboto',
      fontSize: 'lg',
      fontWeight: 'normal',
      color: '#FFFFFF',
      backgroundColor: '#000000BB',
      position: 'bottom',
      alignment: 'center',
      animation: 'none',
      outlineColor: '#000000',
      outlineWidth: 0,
      padding: 10,
      borderRadius: 2,
      maxCharsPerLine: 44,
      wordsPerGroup: 7,
    },
  },
  bold_pop: {
    label: 'Bold Pop',
    style: {
      fontFamily: 'montserrat',
      fontSize: 'xl',
      fontWeight: 'bold',
      color: '#FFFFFF',
      backgroundColor: '#E11D4888',
      position: 'bottom',
      alignment: 'center',
      animation: 'slide-up',
      outlineColor: '#000000',
      outlineWidth: 0,
      padding: 12,
      borderRadius: 8,
      maxCharsPerLine: 30,
      wordsPerGroup: 4,
    },
  },
}

// SRT file generation
export function generateSRT(captions: CaptionLine[]): string {
  return captions.map((c, i) => {
    const start = formatSRTTime(c.start)
    const end = formatSRTTime(c.end)
    return `${i + 1}\n${start} --> ${end}\n${c.text}\n`
  }).join('\n')
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

// Parse script into timed caption lines (for when no word-level timestamps exist)
export function scriptToCaptions(script: string, totalDuration: number, maxCharsPerLine = 42): CaptionLine[] {
  const words = script.trim().split(/\s+/)
  const lines: CaptionLine[] = []
  let wordIndex = 0
  let lineId = 1

  // Estimate words per second based on average speaking rate (130 wpm)
  const wps = 130 / 60

  while (wordIndex < words.length) {
    let line = ''
    const startWord = wordIndex

    while (wordIndex < words.length && (line + ' ' + words[wordIndex]).trim().length <= maxCharsPerLine) {
      line = (line + ' ' + words[wordIndex]).trim()
      wordIndex++
    }

    const startTime = startWord / wps
    const endTime = wordIndex / wps

    lines.push({
      id: lineId++,
      text: line,
      start: Math.min(startTime, totalDuration - 0.5),
      end: Math.min(endTime, totalDuration),
    })
  }

  return lines
}
