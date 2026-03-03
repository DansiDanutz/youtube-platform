'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Mic,
  Play,
  Pause,
  Square,
  Download,
  Loader2,
  RefreshCw,
  Volume2,
  Globe,
  ChevronDown,
  ChevronRight,
  Check,
  Gauge,
  Music2,
} from 'lucide-react'
import {
  LANGUAGES,
  VOICE_PRESETS,
  DEFAULT_CONFIG,
  STYLE_LABELS,
  STYLE_COLORS,
  getVoicesForLanguage,
  type VoiceoverConfig,
  type VoicePreset,
  type Language,
} from '@/lib/voices'

interface VoiceoverStudioProps {
  script: string
  onVoiceoverReady?: (audioUrl: string, config: VoiceoverConfig) => void
}

type PlayState = 'idle' | 'loading' | 'playing' | 'paused'

// Group languages by region
const REGIONS = ['Americas', 'Europe', 'Asia', 'Middle East', 'Oceania']
function groupByRegion(langs: Language[]) {
  const map: Record<string, Language[]> = {}
  for (const lang of langs) {
    const r = lang.region
    if (!map[r]) map[r] = []
    map[r].push(lang)
  }
  return map
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs font-mono text-gray-300">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded appearance-none bg-gray-700 cursor-pointer accent-purple-500"
      />
    </div>
  )
}

export default function VoiceoverStudio({ script, onVoiceoverReady }: VoiceoverStudioProps) {
  const [config, setConfig] = useState<VoiceoverConfig>(DEFAULT_CONFIG)
  const [playState, setPlayState] = useState<PlayState>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [langSearch, setLangSearch] = useState('')
  const [showLangPicker, setShowLangPicker] = useState(false)
  const [previewText, setPreviewText] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const currentLang = LANGUAGES.find(l => l.code === config.languageCode)
  const voicesForLang = getVoicesForLanguage(config.languageCode)
  const currentVoice = voicesForLang.find(v => v.id === config.voiceId) ?? voicesForLang[0]

  // Reset voice when language changes
  useEffect(() => {
    const voices = getVoicesForLanguage(config.languageCode)
    if (voices.length > 0 && !voices.find(v => v.id === config.voiceId)) {
      setConfig(prev => ({ ...prev, voiceId: voices[0].id }))
    }
  }, [config.languageCode, config.voiceId])

  const setLang = (code: string) => {
    setConfig(prev => ({ ...prev, languageCode: code }))
    setShowLangPicker(false)
    setAudioUrl(null)
    setPlayState('idle')
  }

  const setVoice = (id: string) => {
    setConfig(prev => ({ ...prev, voiceId: id }))
    setAudioUrl(null)
    setPlayState('idle')
  }

  const updateConfig = (patch: Partial<VoiceoverConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }))
    setAudioUrl(null)
    setPlayState('idle')
  }

  // Browser Web Speech API preview
  const browserPreview = useCallback((text: string) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()

    const utt = new SpeechSynthesisUtterance(text)
    utt.lang = config.languageCode
    utt.rate = config.speed
    utt.pitch = 1 + config.pitch / 10
    utt.volume = config.volume

    // Try to match voice hint
    if (currentVoice?.webSpeechHint) {
      const voices = window.speechSynthesis.getVoices()
      const match = voices.find(v =>
        v.name.includes(currentVoice.webSpeechHint!) ||
        v.lang.startsWith(config.languageCode.slice(0, 2))
      )
      if (match) utt.voice = match
    }

    utt.onstart = () => setPlayState('playing')
    utt.onend = () => setPlayState('idle')
    utt.onerror = () => setPlayState('idle')

    synthRef.current = utt
    window.speechSynthesis.speak(utt)
    setPlayState('loading')
  }, [config, currentVoice])

  const stopBrowserSpeech = () => {
    window.speechSynthesis?.cancel()
    setPlayState('idle')
  }

  // API-based voiceover generation
  const generateVoiceover = useCallback(async (textToGenerate: string, preview = false) => {
    setPlayState('loading')
    setIsPreviewMode(preview)

    try {
      const res = await fetch('/api/youtube/generate-voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToGenerate, config }),
      })

      if (!res.ok) throw new Error('API error')

      const contentType = res.headers.get('Content-Type') ?? ''

      if (contentType.includes('audio')) {
        // Real audio from ElevenLabs or OpenAI
        const providerHeader = res.headers.get('X-Provider') ?? 'api'
        setProvider(providerHeader)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        if (!preview) onVoiceoverReady?.(url, config)
        playAudio(url)
      } else {
        // Fallback: browser Web Speech
        const data = await res.json() as { provider: string; text: string; speed: number; pitch: number; volume: number; languageCode: string }
        setProvider('browser')
        browserPreview(data.text)
      }
    } catch {
      browserPreview(textToGenerate)
    }
  }, [config, onVoiceoverReady, browserPreview])

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    const audio = new Audio(url)
    audio.playbackRate = config.speed
    audio.volume = config.volume
    audioRef.current = audio

    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.ontimeupdate = () => setProgress(audio.currentTime / (audio.duration || 1))
    audio.onplay = () => setPlayState('playing')
    audio.onpause = () => setPlayState('paused')
    audio.onended = () => { setPlayState('idle'); setProgress(0) }

    audio.play()
  }

  const handlePlayPause = () => {
    if (playState === 'idle') {
      const text = isPreviewMode ? (previewText || script.slice(0, 200)) : script
      generateVoiceover(text, isPreviewMode)
      return
    }
    if (playState === 'playing') {
      if (audioRef.current) audioRef.current.pause()
      else stopBrowserSpeech()
      return
    }
    if (playState === 'paused' && audioRef.current) {
      audioRef.current.play()
    }
  }

  const handleStop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    stopBrowserSpeech()
    setProgress(0)
  }

  const handleDownload = () => {
    if (!audioUrl) return
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `voiceover-${config.languageCode}.mp3`
    a.click()
  }

  const filteredLangs = LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  )
  const groupedLangs = groupByRegion(filteredLangs)

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Voiceover Studio</h3>
          {provider && (
            <Badge variant="secondary" className="text-xs">
              via {provider === 'elevenlabs' ? 'ElevenLabs' : provider === 'openai' ? 'OpenAI TTS' : 'Browser'}
            </Badge>
          )}
        </div>
        {audioUrl && (
          <Button variant="outline" size="sm" className="gap-1" onClick={handleDownload}>
            <Download className="w-3 h-3" /> Download MP3
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Language + Voice Selection */}
        <div className="space-y-3">
          {/* Language Picker */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Language</p>
            <div className="relative">
              <button
                onClick={() => setShowLangPicker(p => !p)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm hover:border-gray-500 transition-colors"
              >
                <span className="text-lg">{currentLang?.flag}</span>
                <span className="flex-1 text-left text-gray-200">{currentLang?.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showLangPicker && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-gray-800">
                    <Input
                      value={langSearch}
                      onChange={e => setLangSearch(e.target.value)}
                      placeholder="Search language…"
                      className="h-7 text-xs bg-gray-800 border-gray-700"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {REGIONS.map(region => {
                      const langs = groupedLangs[region]
                      if (!langs?.length) return null
                      return (
                        <div key={region}>
                          <div className="px-3 py-1 text-[10px] text-gray-500 uppercase tracking-wider bg-gray-800/50">
                            {region}
                          </div>
                          {langs.map(lang => (
                            <button
                              key={lang.code}
                              onClick={() => setLang(lang.code)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 text-sm transition-colors"
                            >
                              <span>{lang.flag}</span>
                              <span className="flex-1 text-left text-gray-200">{lang.name}</span>
                              <span className="text-xs text-gray-500">{lang.nativeName}</span>
                              {lang.code === config.languageCode && (
                                <Check className="w-3 h-3 text-green-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice Selection */}
          <div>
            <p className="text-xs text-gray-400 mb-1.5">Voice ({voicesForLang.length} available)</p>
            <div className="grid grid-cols-2 gap-1.5">
              {voicesForLang.map(voice => (
                <button
                  key={voice.id}
                  onClick={() => setVoice(voice.id)}
                  className={`flex items-start gap-2 p-2 rounded-lg border text-left transition-colors ${
                    config.voiceId === voice.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg mt-0.5">
                    {voice.gender === 'female' ? '👩' : voice.gender === 'male' ? '👨' : '🧑'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-200 truncate">{voice.name}</div>
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      <span className={`text-[10px] px-1 rounded ${STYLE_COLORS[voice.style]}`}>
                        {STYLE_LABELS[voice.style]}
                      </span>
                      <span className="text-[10px] text-gray-500 capitalize">{voice.ageGroup}</span>
                    </div>
                  </div>
                  {config.voiceId === voice.id && (
                    <Check className="w-3 h-3 text-blue-400 ml-auto shrink-0 mt-1" />
                  )}
                </button>
              ))}
              {voicesForLang.length === 0 && (
                <p className="text-xs text-gray-500 col-span-2">No voices for this language yet. Browser TTS will be used.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls + Player */}
        <div className="space-y-3">
          {/* Speed / Pitch / Volume */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs text-gray-400 flex items-center gap-1">
                <Gauge className="w-3 h-3" /> Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-3">
              <SliderControl
                label="Speed"
                value={config.speed}
                min={0.5}
                max={2.0}
                step={0.05}
                display={`${config.speed.toFixed(2)}×`}
                onChange={v => updateConfig({ speed: v })}
              />
              <SliderControl
                label="Pitch"
                value={config.pitch}
                min={-10}
                max={10}
                step={1}
                display={config.pitch === 0 ? 'Normal' : config.pitch > 0 ? `+${config.pitch}` : `${config.pitch}`}
                onChange={v => updateConfig({ pitch: v })}
              />
              <SliderControl
                label="Volume"
                value={config.volume}
                min={0}
                max={1}
                step={0.05}
                display={`${Math.round(config.volume * 100)}%`}
                onChange={v => updateConfig({ volume: v })}
              />
              <SliderControl
                label="Sentence pause"
                value={config.pauseBetweenSentences}
                min={0}
                max={1500}
                step={100}
                display={`${config.pauseBetweenSentences}ms`}
                onChange={v => updateConfig({ pauseBetweenSentences: v })}
              />
            </CardContent>
          </Card>

          {/* Preview text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-400">Quick Preview Text</p>
              <button
                onClick={() => setPreviewText(script.slice(0, 150))}
                className="text-[10px] text-blue-400 hover:text-blue-300"
              >
                Use script
              </button>
            </div>
            <textarea
              value={previewText}
              onChange={e => setPreviewText(e.target.value)}
              placeholder="Type a sample phrase to preview this voice…"
              rows={2}
              className="w-full text-sm bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Playback controls */}
          <div className="space-y-2">
            {/* Progress bar */}
            {duration > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>{formatTime(progress * duration)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {/* Preview button */}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1"
                disabled={playState === 'loading'}
                onClick={() => {
                  setIsPreviewMode(true)
                  generateVoiceover(previewText || script.slice(0, 150), true)
                }}
              >
                {playState === 'loading' && isPreviewMode ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Play className="w-3 h-3" />
                )}
                Preview
              </Button>

              {/* Full voiceover */}
              <Button
                className="flex-1 gap-1 bg-blue-600 hover:bg-blue-700"
                size="sm"
                disabled={playState === 'loading' || !script.trim()}
                onClick={() => {
                  setIsPreviewMode(false)
                  handlePlayPause()
                }}
              >
                {playState === 'loading' && !isPreviewMode ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                ) : playState === 'playing' && !isPreviewMode ? (
                  <><Pause className="w-3 h-3" /> Pause</>
                ) : audioUrl && !isPreviewMode ? (
                  <><RefreshCw className="w-3 h-3" /> Regenerate</>
                ) : (
                  <><Mic className="w-3 h-3" /> Generate Full</>
                )}
              </Button>

              {playState !== 'idle' && (
                <Button variant="outline" size="sm" className="w-8 p-0" onClick={handleStop}>
                  <Square className="w-3 h-3" />
                </Button>
              )}
            </div>

            {audioUrl && (
              <p className="text-xs text-green-400 text-center">
                ✓ Voiceover ready · {currentLang?.flag} {currentLang?.name} · {currentVoice?.name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
