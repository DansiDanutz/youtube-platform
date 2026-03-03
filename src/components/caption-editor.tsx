'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Subtitles,
  Palette,
  Download,
  Play,
  RefreshCw,
  Loader2,
  Type,
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronUp,
  ChevronDown,
  Minus,
  Wand2,
} from 'lucide-react'
import {
  type CaptionLine,
  type CaptionStyle,
  CAPTION_STYLE_PRESETS,
  generateSRT,
} from '@/lib/captions'

interface CaptionEditorProps {
  script: string
  duration: number   // seconds
  onCaptionsReady?: (captions: CaptionLine[], style: CaptionStyle) => void
}

const FONT_SIZE_MAP = { sm: '14px', md: '18px', lg: '22px', xl: '28px' }
const FONT_WEIGHT_MAP = { normal: '400', semibold: '600', bold: '700' }
const FONT_FAMILY_MAP = {
  inter: 'Inter, sans-serif',
  roboto: 'Roboto, sans-serif',
  impact: 'Impact, sans-serif',
  montserrat: 'Montserrat, sans-serif',
  playfair: 'Playfair Display, serif',
}

function CaptionPreview({ line, style }: { line: CaptionLine; style: CaptionStyle }) {
  const positionStyle: React.CSSProperties =
    style.position === 'bottom'
      ? { bottom: '12%' }
      : style.position === 'top'
      ? { top: '12%' }
      : { top: '50%', transform: 'translateY(-50%)' }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {/* Fake video background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <Play className="w-12 h-12 text-gray-600 opacity-40" />
      </div>
      {/* Caption overlay */}
      <div
        className="absolute left-0 right-0 px-4 flex"
        style={{
          ...positionStyle,
          justifyContent:
            style.alignment === 'left'
              ? 'flex-start'
              : style.alignment === 'right'
              ? 'flex-end'
              : 'center',
        }}
      >
        <span
          style={{
            fontFamily: FONT_FAMILY_MAP[style.fontFamily],
            fontSize: FONT_SIZE_MAP[style.fontSize],
            fontWeight: FONT_WEIGHT_MAP[style.fontWeight],
            color: style.color,
            backgroundColor: style.backgroundColor,
            padding: `${style.padding}px ${style.padding * 2}px`,
            borderRadius: `${style.borderRadius}px`,
            WebkitTextStroke: style.outlineWidth > 0
              ? `${style.outlineWidth}px ${style.outlineColor}`
              : undefined,
            textAlign: style.alignment,
            maxWidth: '80%',
            display: 'inline-block',
          }}
        >
          {line.text}
        </span>
      </div>
    </div>
  )
}

function ColorSwatch({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-24">{label}</span>
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          className="w-6 h-6 rounded border border-gray-600"
          style={{ backgroundColor: value.length >= 7 ? value.slice(0, 7) : value }}
        />
        <input
          type="color"
          value={value.length >= 7 ? value.slice(0, 7) : '#ffffff'}
          onChange={e => onChange(e.target.value)}
          className="w-0 h-0 opacity-0 absolute"
        />
        <span className="text-xs text-gray-400 font-mono">{value}</span>
      </label>
    </div>
  )
}

export default function CaptionEditor({ script, duration, onCaptionsReady }: CaptionEditorProps) {
  const [captions, setCaptions] = useState<CaptionLine[]>([])
  const [style, setStyle] = useState<CaptionStyle>(CAPTION_STYLE_PRESETS.standard.style)
  const [activePreset, setActivePreset] = useState<string>('standard')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  const generateCaptions = useCallback(async () => {
    if (!script.trim()) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/youtube/generate-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          duration,
          maxCharsPerLine: style.maxCharsPerLine,
        }),
      })
      if (res.ok) {
        const data = await res.json() as { captions: CaptionLine[] }
        setCaptions(data.captions)
        setPreviewIndex(0)
        onCaptionsReady?.(data.captions, style)
      }
    } catch (e) {
      console.error('Caption generation failed', e)
    } finally {
      setIsGenerating(false)
    }
  }, [script, duration, style, onCaptionsReady])

  const applyPreset = (presetKey: string) => {
    const preset = CAPTION_STYLE_PRESETS[presetKey]
    if (preset) {
      setStyle(preset.style)
      setActivePreset(presetKey)
    }
  }

  const updateStyle = (patch: Partial<CaptionStyle>) => {
    setStyle(prev => ({ ...prev, ...patch }))
    setActivePreset('custom')
  }

  const startEdit = (c: CaptionLine) => {
    setEditingId(c.id)
    setEditText(c.text)
  }

  const commitEdit = () => {
    if (editingId === null) return
    setCaptions(prev =>
      prev.map(c => (c.id === editingId ? { ...c, text: editText } : c))
    )
    setEditingId(null)
  }

  const downloadSRT = () => {
    const srt = generateSRT(captions)
    const blob = new Blob([srt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'captions.srt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const currentCaption = captions[previewIndex]

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Subtitles className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">Auto-Captions</h3>
          {captions.length > 0 && (
            <Badge variant="secondary">{captions.length} lines</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {captions.length > 0 && (
            <Button variant="outline" size="sm" onClick={downloadSRT} className="gap-1">
              <Download className="w-3 h-3" /> SRT
            </Button>
          )}
          <Button
            size="sm"
            onClick={generateCaptions}
            disabled={isGenerating || !script.trim()}
            className="gap-1 bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
            ) : captions.length > 0 ? (
              <><RefreshCw className="w-3 h-3" /> Regenerate</>
            ) : (
              <><Wand2 className="w-3 h-3" /> Generate Captions</>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="style">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="style"><Palette className="w-3 h-3 mr-1" />Style</TabsTrigger>
          <TabsTrigger value="preview"><Play className="w-3 h-3 mr-1" />Preview</TabsTrigger>
          <TabsTrigger value="edit"><Type className="w-3 h-3 mr-1" />Edit Lines</TabsTrigger>
        </TabsList>

        {/* ── STYLE TAB ── */}
        <TabsContent value="style" className="space-y-4 mt-3">
          {/* Presets */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Presets</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CAPTION_STYLE_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant={activePreset === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => applyPreset(key)}
                  className={activePreset === key ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Font */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs text-gray-400">Font</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="flex gap-2">
                  {(['inter', 'roboto', 'impact', 'montserrat', 'playfair'] as const).map(f => (
                    <Button
                      key={f}
                      variant={style.fontFamily === f ? 'default' : 'outline'}
                      size="sm"
                      className={`text-xs ${style.fontFamily === f ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      onClick={() => updateStyle({ fontFamily: f })}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(['sm', 'md', 'lg', 'xl'] as const).map(s => (
                    <Button
                      key={s}
                      variant={style.fontSize === s ? 'default' : 'outline'}
                      size="sm"
                      className={style.fontSize === s ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      onClick={() => updateStyle({ fontSize: s })}
                    >
                      {s.toUpperCase()}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(['normal', 'semibold', 'bold'] as const).map(w => (
                    <Button
                      key={w}
                      variant={style.fontWeight === w ? 'default' : 'outline'}
                      size="sm"
                      className={style.fontWeight === w ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      onClick={() => updateStyle({ fontWeight: w })}
                    >
                      {w.charAt(0).toUpperCase() + w.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs text-gray-400">Colors</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <ColorSwatch label="Text" value={style.color} onChange={v => updateStyle({ color: v })} />
                <ColorSwatch label="Background" value={style.backgroundColor} onChange={v => updateStyle({ backgroundColor: v })} />
                <ColorSwatch label="Outline" value={style.outlineColor} onChange={v => updateStyle({ outlineColor: v })} />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-24">Outline width</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="w-6 h-6 p-0" onClick={() => updateStyle({ outlineWidth: Math.max(0, style.outlineWidth - 1) })}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs w-4 text-center">{style.outlineWidth}</span>
                    <Button variant="outline" size="sm" className="w-6 h-6 p-0" onClick={() => updateStyle({ outlineWidth: Math.min(6, style.outlineWidth + 1) })}>
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Position & Alignment */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs text-gray-400">Position & Alignment</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="flex gap-2">
                  {(['top', 'center', 'bottom'] as const).map(p => (
                    <Button
                      key={p}
                      variant={style.position === p ? 'default' : 'outline'}
                      size="sm"
                      className={style.position === p ? 'bg-purple-600 hover:bg-purple-700' : ''}
                      onClick={() => updateStyle({ position: p })}
                    >
                      {p === 'top' ? <ChevronUp className="w-3 h-3" /> : p === 'bottom' ? <ChevronDown className="w-3 h-3" /> : '—'}
                      <span className="ml-1 capitalize">{p}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant={style.alignment === 'left' ? 'default' : 'outline'} size="sm" className={style.alignment === 'left' ? 'bg-purple-600 hover:bg-purple-700' : ''} onClick={() => updateStyle({ alignment: 'left' })}>
                    <AlignLeft className="w-3 h-3" />
                  </Button>
                  <Button variant={style.alignment === 'center' ? 'default' : 'outline'} size="sm" className={style.alignment === 'center' ? 'bg-purple-600 hover:bg-purple-700' : ''} onClick={() => updateStyle({ alignment: 'center' })}>
                    <AlignCenter className="w-3 h-3" />
                  </Button>
                  <Button variant={style.alignment === 'right' ? 'default' : 'outline'} size="sm" className={style.alignment === 'right' ? 'bg-purple-600 hover:bg-purple-700' : ''} onClick={() => updateStyle({ alignment: 'right' })}>
                    <AlignRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Animation */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2 pt-3 px-3">
                <CardTitle className="text-xs text-gray-400">Animation</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {(['none', 'fade', 'slide-up', 'typewriter', 'karaoke'] as const).map(a => (
                    <Button
                      key={a}
                      variant={style.animation === a ? 'default' : 'outline'}
                      size="sm"
                      className={`text-xs ${style.animation === a ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                      onClick={() => updateStyle({ animation: a })}
                    >
                      {a === 'none' ? 'None' : a === 'slide-up' ? 'Slide Up' : a === 'typewriter' ? 'Typewriter' : a.charAt(0).toUpperCase() + a.slice(1)}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Words/group</span>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="w-6 h-6 p-0" onClick={() => updateStyle({ wordsPerGroup: Math.max(1, style.wordsPerGroup - 1) })}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs w-4 text-center">{style.wordsPerGroup}</span>
                    <Button variant="outline" size="sm" className="w-6 h-6 p-0" onClick={() => updateStyle({ wordsPerGroup: Math.min(10, style.wordsPerGroup + 1) })}>
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PREVIEW TAB ── */}
        <TabsContent value="preview" className="mt-3">
          {captions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Subtitles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Generate captions first to preview them</p>
            </div>
          ) : (
            <div className="space-y-3">
              <CaptionPreview line={currentCaption} style={style} />
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex(i => i - 1)}
                >
                  ← Prev
                </Button>
                <span className="text-sm text-gray-400">
                  Line {previewIndex + 1} / {captions.length}
                  <span className="ml-2 font-mono text-xs">
                    {currentCaption.start.toFixed(1)}s → {currentCaption.end.toFixed(1)}s
                  </span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={previewIndex === captions.length - 1}
                  onClick={() => setPreviewIndex(i => i + 1)}
                >
                  Next →
                </Button>
              </div>
              <div className="text-center">
                <p className="text-lg text-white font-medium">{currentCaption.text}</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── EDIT LINES TAB ── */}
        <TabsContent value="edit" className="mt-3">
          {captions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Type className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Generate captions to edit individual lines</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {captions.map((c, idx) => (
                <div
                  key={c.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-800 group cursor-pointer"
                  onClick={() => { if (editingId !== c.id) startEdit(c) }}
                >
                  <span className="text-xs text-gray-500 font-mono pt-1 w-10 shrink-0">
                    {c.start.toFixed(1)}s
                  </span>
                  {editingId === c.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null) }}
                        className="h-7 text-sm bg-gray-700 border-purple-500"
                        autoFocus
                      />
                      <Button size="sm" className="h-7 bg-purple-600 hover:bg-purple-700 shrink-0" onClick={commitEdit}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-200 flex-1">{c.text}</span>
                  )}
                  <Badge variant="secondary" className="text-xs shrink-0 opacity-0 group-hover:opacity-100">
                    #{idx + 1}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
