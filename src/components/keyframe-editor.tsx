'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Film,
  Plus,
  Trash2,
  Play,
  Pause,
  Square,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Wand2,
  Clock,
} from 'lucide-react'
import {
  ANIMATION_PRESETS,
  PROPERTY_META,
  EASING_PRESETS,
  interpolateAtTime,
  propertiesToTransform,
  exportToCSSAnimation,
  exportAllToJSON,
  DEFAULT_PROPS,
  type Keyframe,
  type SceneKeyframes,
  type KeyframeProperty,
  type EasingName,
  type AnimationPreset,
} from '@/lib/keyframes'
import { type VideoScene } from '@/lib/types'

interface KeyframeEditorProps {
  scenes: VideoScene[]
  onChange?: (sceneKeyframes: SceneKeyframes[]) => void
}

const TRACK_HEIGHT = 32
const TIMELINE_WIDTH = 480
const HEADER_WIDTH = 96

function formatTime(s: number): string {
  return `${s.toFixed(1)}s`
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

// ── Mini preview of a single scene with its keyframe animation ───────────────
function ScenePreview({
  imageUrl,
  keyframes,
  duration,
  isPlaying,
  time,
}: {
  imageUrl: string | null
  keyframes: Keyframe[]
  duration: number
  isPlaying: boolean
  time: number
}) {
  const props = interpolateAtTime(keyframes, time)

  return (
    <div
      className="relative w-full overflow-hidden rounded bg-gray-900 border border-gray-700"
      style={{ aspectRatio: '16/9' }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Scene preview"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: propertiesToTransform(props),
            opacity: props.opacity,
            filter: props.blur > 0 ? `blur(${props.blur}px)` : undefined,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Film className="w-8 h-8 text-gray-600" />
        </div>
      )}
      {/* Playhead overlay */}
      <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-800/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full transition-none"
          style={{ width: `${(time / duration) * 100}%` }}
        />
      </div>
      <div className="absolute bottom-3 right-2 text-[10px] text-white/70 font-mono">
        {formatTime(time)}
      </div>
    </div>
  )
}

// ── Timeline track ────────────────────────────────────────────────────────────
function Track({
  label,
  color,
  keyframes,
  duration,
  selectedKfId,
  onSeek,
  onSelectKf,
  onAddKf,
}: {
  label: string
  color: string
  keyframes: Keyframe[]
  duration: number
  selectedKfId: string | null
  onSeek: (t: number) => void
  onSelectKf: (id: string) => void
  onAddKf: (t: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  const getTimeFromClick = (e: React.MouseEvent) => {
    const rect = trackRef.current!.getBoundingClientRect()
    const x = clamp(e.clientX - rect.left, 0, rect.width)
    return (x / rect.width) * duration
  }

  return (
    <div className="flex items-center" style={{ height: TRACK_HEIGHT }}>
      <div
        className="flex items-center shrink-0 pr-2"
        style={{ width: HEADER_WIDTH }}
      >
        <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
        <span className="text-[11px] text-gray-400 truncate">{label}</span>
      </div>
      <div
        ref={trackRef}
        className="relative flex-1 h-5 bg-gray-800 rounded cursor-crosshair border border-gray-700 hover:border-gray-500 transition-colors"
        style={{ width: TIMELINE_WIDTH }}
        onClick={e => { if (e.shiftKey) onAddKf(getTimeFromClick(e)); else onSeek(getTimeFromClick(e)) }}
        title="Click to seek · Shift+click to add keyframe"
      >
        {/* Track fill line */}
        <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2" style={{ backgroundColor: `${color}33` }} />
        {/* Keyframe diamonds */}
        {keyframes.map(kf => {
          const pct = (kf.time / duration) * 100
          const isSelected = kf.id === selectedKfId
          return (
            <button
              key={kf.id}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border transition-all hover:scale-125 focus:outline-none"
              style={{
                left: `${pct}%`,
                backgroundColor: isSelected ? color : `${color}88`,
                borderColor: isSelected ? 'white' : color,
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={e => { e.stopPropagation(); onSelectKf(kf.id) }}
              title={`${formatTime(kf.time)} · ${kf.easing}`}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Property editor for a selected keyframe ──────────────────────────────────
function KeyframePropertyEditor({
  keyframe,
  onChange,
  onDelete,
  onDuplicate,
}: {
  keyframe: Keyframe
  onChange: (patch: Partial<Keyframe>) => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const propKeys = Object.keys(PROPERTY_META) as (keyof KeyframeProperty)[]

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs text-gray-300 flex items-center gap-1.5">
            <div className="w-2 h-2 rotate-45 bg-blue-400" />
            Keyframe @ {formatTime(keyframe.time)}
          </CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDuplicate} title="Duplicate">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={onDelete} title="Delete">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-2">
        {/* Properties */}
        {propKeys.map(key => {
          const meta = PROPERTY_META[key]
          const value = keyframe.properties[key]
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
              <span className="text-[11px] text-gray-400 w-16 shrink-0">{meta.label}</span>
              <input
                type="range"
                min={meta.min}
                max={meta.max}
                step={meta.step}
                value={value}
                onChange={e => onChange({
                  properties: { ...keyframe.properties, [key]: parseFloat(e.target.value) }
                })}
                className="flex-1 h-1.5 rounded accent-purple-500 cursor-pointer"
              />
              <span className="text-[11px] font-mono text-gray-300 w-12 text-right shrink-0">
                {key === 'scale'
                  ? `${value.toFixed(2)}×`
                  : key === 'opacity'
                  ? `${Math.round(value * 100)}%`
                  : `${value > 0 && key !== 'blur' ? '+' : ''}${value.toFixed(key === 'blur' ? 1 : 0)}${meta.unit}`
                }
              </span>
            </div>
          )
        })}

        {/* Easing */}
        <div className="pt-1 border-t border-gray-700">
          <p className="text-[11px] text-gray-400 mb-1.5">Easing (to next keyframe)</p>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(EASING_PRESETS) as EasingName[]).map(e => (
              <button
                key={e}
                onClick={() => onChange({ easing: e })}
                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                  keyframe.easing === e
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-400'
                }`}
              >
                {EASING_PRESETS[e].label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main KeyframeEditor ───────────────────────────────────────────────────────
export default function KeyframeEditor({ scenes, onChange }: KeyframeEditorProps) {
  const [allSceneKF, setAllSceneKF] = useState<SceneKeyframes[]>(() =>
    scenes.map(s => ({
      sceneId: s.id,
      duration: s.duration || 5,
      keyframes: ANIMATION_PRESETS[0].buildKeyframes(s.duration || 5),
    }))
  )
  const [activeSceneId, setActiveSceneId] = useState<number>(scenes[0]?.id ?? 0)
  const [selectedKfId, setSelectedKfId] = useState<string | null>(null)
  const [playTime, setPlayTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const playRaf = useRef<number | null>(null)
  const playStart = useRef<number>(0)
  const playOffset = useRef<number>(0)
  const [expandedPresets, setExpandedPresets] = useState(false)
  const [copiedCSS, setCopiedCSS] = useState(false)

  const activeKF = allSceneKF.find(s => s.sceneId === activeSceneId)
  const activeScene = scenes.find(s => s.id === activeSceneId)
  const selectedKf = activeKF?.keyframes.find(k => k.id === selectedKfId) ?? null

  // Update parent
  useEffect(() => {
    onChange?.(allSceneKF)
  }, [allSceneKF, onChange])

  const updateSceneKF = useCallback((sceneId: number, patch: Partial<SceneKeyframes>) => {
    setAllSceneKF(prev => prev.map(s => s.sceneId === sceneId ? { ...s, ...patch } : s))
  }, [])

  const updateKeyframe = useCallback((sceneId: number, kfId: string, patch: Partial<Keyframe>) => {
    setAllSceneKF(prev => prev.map(s =>
      s.sceneId !== sceneId ? s : {
        ...s,
        keyframes: s.keyframes.map(k => k.id === kfId ? { ...k, ...patch } : k)
      }
    ))
  }, [])

  const addKeyframe = useCallback((sceneId: number, time: number) => {
    const skf = allSceneKF.find(s => s.sceneId === sceneId)
    if (!skf) return
    const props = interpolateAtTime(skf.keyframes, time)
    const newKf: Keyframe = {
      id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      time: clamp(time, 0, skf.duration),
      properties: props,
      easing: 'ease-in-out',
    }
    updateSceneKF(sceneId, { keyframes: [...skf.keyframes, newKf].sort((a, b) => a.time - b.time) })
    setSelectedKfId(newKf.id)
  }, [allSceneKF, updateSceneKF])

  const deleteKeyframe = useCallback((sceneId: number, kfId: string) => {
    const skf = allSceneKF.find(s => s.sceneId === sceneId)
    if (!skf || skf.keyframes.length <= 2) return // keep at least 2
    updateSceneKF(sceneId, { keyframes: skf.keyframes.filter(k => k.id !== kfId) })
    setSelectedKfId(null)
  }, [allSceneKF, updateSceneKF])

  const duplicateKeyframe = useCallback((sceneId: number, kfId: string) => {
    const skf = allSceneKF.find(s => s.sceneId === sceneId)
    if (!skf) return
    const src = skf.keyframes.find(k => k.id === kfId)
    if (!src) return
    const newKf: Keyframe = {
      ...src,
      id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      time: Math.min(src.time + 0.5, skf.duration),
    }
    updateSceneKF(sceneId, { keyframes: [...skf.keyframes, newKf].sort((a, b) => a.time - b.time) })
    setSelectedKfId(newKf.id)
  }, [allSceneKF, updateSceneKF])

  const applyPreset = useCallback((sceneId: number, preset: AnimationPreset) => {
    const skf = allSceneKF.find(s => s.sceneId === sceneId)
    if (!skf) return
    updateSceneKF(sceneId, { keyframes: preset.buildKeyframes(skf.duration) })
    setSelectedKfId(null)
  }, [allSceneKF, updateSceneKF])

  // Playback
  const startPlay = useCallback(() => {
    const skf = allSceneKF.find(s => s.sceneId === activeSceneId)
    if (!skf) return
    playStart.current = performance.now()
    playOffset.current = playTime
    setIsPlaying(true)

    const tick = () => {
      const elapsed = (performance.now() - playStart.current) / 1000
      const t = playOffset.current + elapsed
      if (t >= skf.duration) {
        setPlayTime(skf.duration)
        setIsPlaying(false)
        return
      }
      setPlayTime(t)
      playRaf.current = requestAnimationFrame(tick)
    }
    playRaf.current = requestAnimationFrame(tick)
  }, [activeSceneId, allSceneKF, playTime])

  const stopPlay = useCallback(() => {
    if (playRaf.current) cancelAnimationFrame(playRaf.current)
    setIsPlaying(false)
  }, [])

  const resetPlay = useCallback(() => {
    stopPlay()
    setPlayTime(0)
  }, [stopPlay])

  useEffect(() => () => { if (playRaf.current) cancelAnimationFrame(playRaf.current) }, [])

  // Export CSS
  const handleExportCSS = () => {
    if (!activeKF) return
    const css = exportToCSSAnimation(activeKF, `scene-${activeSceneId}-anim`)
    navigator.clipboard.writeText(css).then(() => {
      setCopiedCSS(true)
      setTimeout(() => setCopiedCSS(false), 2000)
    })
  }

  const handleExportJSON = () => {
    const json = exportAllToJSON(allSceneKF)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'keyframes.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!activeKF || !activeScene) return null

  const propKeys = Object.keys(PROPERTY_META) as (keyof KeyframeProperty)[]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-yellow-400" />
          <h3 className="font-semibold text-white">Keyframe Control</h3>
          <Badge variant="secondary">{allSceneKF.reduce((n, s) => n + s.keyframes.length, 0)} keyframes</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={handleExportCSS}>
            {copiedCSS ? '✓ Copied' : <><Copy className="w-3 h-3" /> CSS</>}
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={handleExportJSON}>
            <Download className="w-3 h-3" /> JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Scene list + preview */}
        <div className="space-y-3">
          {/* Scene tabs */}
          <div className="flex flex-wrap gap-1">
            {scenes.map((scene, idx) => {
              const skf = allSceneKF.find(s => s.sceneId === scene.id)
              return (
                <button
                  key={scene.id}
                  onClick={() => { setActiveSceneId(scene.id); setSelectedKfId(null); resetPlay() }}
                  className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                    activeSceneId === scene.id
                      ? 'bg-yellow-600/20 border-yellow-500 text-yellow-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  Scene {idx + 1}
                  {skf && <span className="ml-1 text-[10px] opacity-60">{skf.keyframes.length}kf</span>}
                </button>
              )
            })}
          </div>

          {/* Preview */}
          <ScenePreview
            imageUrl={activeScene.imageUrl}
            keyframes={activeKF.keyframes}
            duration={activeKF.duration}
            isPlaying={isPlaying}
            time={playTime}
          />

          {/* Playback controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={resetPlay}
              disabled={!isPlaying && playTime === 0}
            >
              <Square className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              className={`flex-1 gap-1 ${isPlaying ? 'bg-orange-600 hover:bg-orange-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
              onClick={isPlaying ? stopPlay : startPlay}
            >
              {isPlaying ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Preview</>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => addKeyframe(activeSceneId, playTime)}
              title="Add keyframe at current time"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Time display */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="font-mono">{formatTime(playTime)}</span>
            <span className="font-mono">{formatTime(activeKF.duration)}</span>
          </div>

          {/* Presets */}
          <div>
            <button
              onClick={() => setExpandedPresets(p => !p)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200"
            >
              {expandedPresets ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Wand2 className="w-3 h-3" /> Animation Presets
            </button>
            {expandedPresets && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {ANIMATION_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(activeSceneId, preset)}
                    className="flex items-center gap-1.5 px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded hover:border-yellow-500 hover:text-yellow-300 transition-colors text-left"
                  >
                    <span>{preset.icon}</span>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{preset.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{preset.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Timeline */}
        <div className="lg:col-span-2 space-y-3">
          {/* Timeline header */}
          <div className="flex items-center">
            <div style={{ width: HEADER_WIDTH }} className="shrink-0" />
            <div className="relative flex-1 h-4 flex items-center">
              {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                <div
                  key={pct}
                  className="absolute text-[10px] text-gray-500 -translate-x-1/2 font-mono"
                  style={{ left: `${pct * 100}%` }}
                >
                  {formatTime(pct * activeKF.duration)}
                </div>
              ))}
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-px bg-yellow-400 z-20"
                style={{ left: `${(playTime / activeKF.duration) * 100}%` }}
              />
            </div>
          </div>

          {/* Tracks — one per property */}
          <div className="space-y-0.5">
            {propKeys.map(key => {
              const meta = PROPERTY_META[key]
              return (
                <Track
                  key={key}
                  label={meta.label}
                  color={meta.color}
                  keyframes={activeKF.keyframes}
                  duration={activeKF.duration}
                  selectedKfId={selectedKfId}
                  onSeek={t => { stopPlay(); setPlayTime(clamp(t, 0, activeKF.duration)) }}
                  onSelectKf={id => setSelectedKfId(id === selectedKfId ? null : id)}
                  onAddKf={t => addKeyframe(activeSceneId, t)}
                />
              )
            })}
          </div>

          <p className="text-[10px] text-gray-600">
            Click timeline to seek · Shift+click to add keyframe · Select a keyframe diamond to edit
          </p>

          {/* All keyframes list */}
          <div className="space-y-1">
            <p className="text-xs text-gray-400 font-medium">Keyframes ({activeKF.keyframes.length})</p>
            <div className="flex flex-wrap gap-1">
              {[...activeKF.keyframes]
                .sort((a, b) => a.time - b.time)
                .map(kf => (
                  <button
                    key={kf.id}
                    onClick={() => setSelectedKfId(kf.id === selectedKfId ? null : kf.id)}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded border transition-colors ${
                      kf.id === selectedKfId
                        ? 'bg-yellow-600/20 border-yellow-500 text-yellow-300'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    <div className="w-2 h-2 rotate-45 bg-current" />
                    {formatTime(kf.time)}
                    <span className="text-[10px] opacity-60">{kf.easing}</span>
                  </button>
                ))}
              <button
                onClick={() => addKeyframe(activeSceneId, playTime)}
                className="flex items-center gap-1 px-2 py-1 text-[11px] rounded border border-dashed border-gray-600 text-gray-500 hover:border-yellow-500 hover:text-yellow-400 transition-colors"
              >
                <Plus className="w-2.5 h-2.5" /> Add at {formatTime(playTime)}
              </button>
            </div>
          </div>

          {/* Selected keyframe editor */}
          {selectedKf && (
            <KeyframePropertyEditor
              keyframe={selectedKf}
              onChange={patch => updateKeyframe(activeSceneId, selectedKf.id, patch)}
              onDelete={() => deleteKeyframe(activeSceneId, selectedKf.id)}
              onDuplicate={() => duplicateKeyframe(activeSceneId, selectedKf.id)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
