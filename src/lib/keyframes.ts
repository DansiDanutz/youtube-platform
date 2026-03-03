// Keyframe Animation System for Video Scenes

export type EasingName =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'spring'
  | 'step-start'
  | 'step-end'

export interface KeyframeProperty {
  scale: number       // zoom: 1.0 = 100%, 1.5 = 150%
  translateX: number  // % of frame width, -50 to +50
  translateY: number  // % of frame height, -50 to +50
  rotate: number      // degrees, -180 to +180
  opacity: number     // 0.0 to 1.0
  blur: number        // px, 0 to 20
}

export interface Keyframe {
  id: string
  time: number            // 0.0 to sceneDuration (seconds)
  properties: KeyframeProperty
  easing: EasingName      // easing FROM this keyframe to the next
  label?: string
}

export interface SceneKeyframes {
  sceneId: number
  duration: number        // total scene duration in seconds
  keyframes: Keyframe[]
}

export const DEFAULT_PROPS: KeyframeProperty = {
  scale: 1.0,
  translateX: 0,
  translateY: 0,
  rotate: 0,
  opacity: 1.0,
  blur: 0,
}

export const PROPERTY_META: Record<keyof KeyframeProperty, {
  label: string; unit: string; min: number; max: number; step: number; color: string
}> = {
  scale:      { label: 'Scale',       unit: '×',  min: 0.5, max: 3.0,  step: 0.05, color: '#818CF8' },
  translateX: { label: 'Pan X',       unit: '%',  min: -50, max: 50,   step: 1,    color: '#34D399' },
  translateY: { label: 'Pan Y',       unit: '%',  min: -50, max: 50,   step: 1,    color: '#F472B6' },
  rotate:     { label: 'Rotate',      unit: '°',  min: -180,max: 180,  step: 1,    color: '#FBBF24' },
  opacity:    { label: 'Opacity',     unit: '',   min: 0,   max: 1,    step: 0.05, color: '#60A5FA' },
  blur:       { label: 'Blur',        unit: 'px', min: 0,   max: 20,   step: 0.5,  color: '#A78BFA' },
}

export const EASING_PRESETS: Record<EasingName, { label: string; cssValue: string }> = {
  'linear':       { label: 'Linear',       cssValue: 'linear' },
  'ease-in':      { label: 'Ease In',      cssValue: 'cubic-bezier(0.42,0,1,1)' },
  'ease-out':     { label: 'Ease Out',     cssValue: 'cubic-bezier(0,0,0.58,1)' },
  'ease-in-out':  { label: 'Ease In-Out',  cssValue: 'cubic-bezier(0.42,0,0.58,1)' },
  'bounce':       { label: 'Bounce',       cssValue: 'cubic-bezier(0.34,1.56,0.64,1)' },
  'spring':       { label: 'Spring',       cssValue: 'cubic-bezier(0.175,0.885,0.32,1.275)' },
  'step-start':   { label: 'Step Start',   cssValue: 'steps(1,start)' },
  'step-end':     { label: 'Step End',     cssValue: 'steps(1,end)' },
}

// ── Preset Animations ────────────────────────────────────────────────────────

export interface AnimationPreset {
  id: string
  name: string
  description: string
  icon: string
  buildKeyframes: (duration: number) => Keyframe[]
}

let idCounter = 0
const mkId = () => `kf_${++idCounter}_${Math.random().toString(36).slice(2, 6)}`

export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: 'ken-burns',
    name: 'Ken Burns',
    description: 'Slow zoom in with subtle pan',
    icon: '🎬',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0,   properties: { ...DEFAULT_PROPS, scale: 1.0, translateX: -3, translateY: -2 }, easing: 'ease-in-out' },
      { id: mkId(), time: d,   properties: { ...DEFAULT_PROPS, scale: 1.3, translateX:  3, translateY:  2 }, easing: 'linear' },
    ],
  },
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Punch in from wide to close',
    icon: '🔍',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0,   properties: { ...DEFAULT_PROPS, scale: 1.0 }, easing: 'ease-out' },
      { id: mkId(), time: d,   properties: { ...DEFAULT_PROPS, scale: 1.6 }, easing: 'linear' },
    ],
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Pull back to reveal the scene',
    icon: '🔭',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0,   properties: { ...DEFAULT_PROPS, scale: 1.6 }, easing: 'ease-in-out' },
      { id: mkId(), time: d,   properties: { ...DEFAULT_PROPS, scale: 1.0 }, easing: 'linear' },
    ],
  },
  {
    id: 'pan-right',
    name: 'Pan Right',
    description: 'Slide across the scene left to right',
    icon: '➡️',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0,   properties: { ...DEFAULT_PROPS, scale: 1.2, translateX: -15 }, easing: 'linear' },
      { id: mkId(), time: d,   properties: { ...DEFAULT_PROPS, scale: 1.2, translateX:  15 }, easing: 'linear' },
    ],
  },
  {
    id: 'pan-up',
    name: 'Pan Up',
    description: 'Tilt upward through the scene',
    icon: '⬆️',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0,   properties: { ...DEFAULT_PROPS, scale: 1.2, translateY: 15 }, easing: 'linear' },
      { id: mkId(), time: d,   properties: { ...DEFAULT_PROPS, scale: 1.2, translateY: -15 }, easing: 'linear' },
    ],
  },
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Gentle fade from black',
    icon: '🌅',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0,      properties: { ...DEFAULT_PROPS, opacity: 0 }, easing: 'ease-out' },
      { id: mkId(), time: d * 0.4, properties: { ...DEFAULT_PROPS, opacity: 1 }, easing: 'linear' },
      { id: mkId(), time: d,       properties: { ...DEFAULT_PROPS, opacity: 1 }, easing: 'linear' },
    ],
  },
  {
    id: 'dramatic-zoom',
    name: 'Dramatic Zoom',
    description: 'Fast snap zoom with bounce',
    icon: '💥',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0,       properties: { ...DEFAULT_PROPS, scale: 1.0 }, easing: 'ease-in' },
      { id: mkId(), time: d * 0.3, properties: { ...DEFAULT_PROPS, scale: 2.0 }, easing: 'bounce' },
      { id: mkId(), time: d,       properties: { ...DEFAULT_PROPS, scale: 1.8 }, easing: 'linear' },
    ],
  },
  {
    id: 'rotation-reveal',
    name: 'Rotation Reveal',
    description: 'Slight rotation with zoom',
    icon: '🌀',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0,   properties: { ...DEFAULT_PROPS, scale: 1.1, rotate: -3, opacity: 0 }, easing: 'ease-out' },
      { id: mkId(), time: d * 0.5, properties: { ...DEFAULT_PROPS, scale: 1.2, rotate: 0, opacity: 1 }, easing: 'ease-in-out' },
      { id: mkId(), time: d,   properties: { ...DEFAULT_PROPS, scale: 1.3, rotate: 2, opacity: 1 }, easing: 'linear' },
    ],
  },
  {
    id: 'static',
    name: 'Static',
    description: 'No animation',
    icon: '⏸️',
    buildKeyframes: (d) => [
      { id: mkId(), time: 0, properties: { ...DEFAULT_PROPS }, easing: 'linear' },
      { id: mkId(), time: d, properties: { ...DEFAULT_PROPS }, easing: 'linear' },
    ],
  },
]

// ── Interpolation ────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function applyEasing(t: number, easing: EasingName): number {
  switch (easing) {
    case 'linear': return t
    case 'ease-in': return t * t * t
    case 'ease-out': return 1 - Math.pow(1 - t, 3)
    case 'ease-in-out': return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    case 'bounce': {
      const n1 = 7.5625, d1 = 2.75
      if (t < 1/d1) return n1*t*t
      if (t < 2/d1) return n1*(t-=1.5/d1)*t+.75
      if (t < 2.5/d1) return n1*(t-=2.25/d1)*t+.9375
      return n1*(t-=2.625/d1)*t+.984375
    }
    case 'spring': return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2,-10*t)*Math.sin((t*10-0.75)*(2*Math.PI)/3)+1
    case 'step-start': return t > 0 ? 1 : 0
    case 'step-end': return t >= 1 ? 1 : 0
    default: return t
  }
}

export function interpolateAtTime(keyframes: Keyframe[], time: number): KeyframeProperty {
  if (!keyframes.length) return { ...DEFAULT_PROPS }
  const sorted = [...keyframes].sort((a, b) => a.time - b.time)
  if (time <= sorted[0].time) return { ...sorted[0].properties }
  if (time >= sorted[sorted.length - 1].time) return { ...sorted[sorted.length - 1].properties }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1]
    if (time >= a.time && time <= b.time) {
      const raw = (time - a.time) / (b.time - a.time)
      const t = applyEasing(raw, a.easing)
      return {
        scale:      lerp(a.properties.scale,      b.properties.scale,      t),
        translateX: lerp(a.properties.translateX, b.properties.translateX, t),
        translateY: lerp(a.properties.translateY, b.properties.translateY, t),
        rotate:     lerp(a.properties.rotate,     b.properties.rotate,     t),
        opacity:    lerp(a.properties.opacity,     b.properties.opacity,     t),
        blur:       lerp(a.properties.blur,        b.properties.blur,        t),
      }
    }
  }
  return { ...sorted[sorted.length - 1].properties }
}

// ── CSS Export ───────────────────────────────────────────────────────────────

export function propertiesToTransform(props: KeyframeProperty): string {
  return [
    `scale(${props.scale.toFixed(4)})`,
    `translateX(${props.translateX.toFixed(2)}%)`,
    `translateY(${props.translateY.toFixed(2)}%)`,
    `rotate(${props.rotate.toFixed(2)}deg)`,
  ].join(' ')
}

export function exportToCSSAnimation(sk: SceneKeyframes, animationName: string): string {
  const sorted = [...sk.keyframes].sort((a, b) => a.time - b.time)
  const lines: string[] = [`@keyframes ${animationName} {`]

  for (const kf of sorted) {
    const pct = ((kf.time / sk.duration) * 100).toFixed(2)
    const p = kf.properties
    lines.push(`  ${pct}% {`)
    lines.push(`    transform: ${propertiesToTransform(p)};`)
    lines.push(`    opacity: ${p.opacity.toFixed(3)};`)
    if (p.blur > 0) lines.push(`    filter: blur(${p.blur.toFixed(1)}px);`)
    lines.push(`    animation-timing-function: ${EASING_PRESETS[kf.easing].cssValue};`)
    lines.push(`  }`)
  }

  lines.push(`}`)
  lines.push(``)
  lines.push(`.scene-${sk.sceneId}-animation {`)
  lines.push(`  animation: ${animationName} ${sk.duration}s ${EASING_PRESETS[sorted[0]?.easing ?? 'linear'].cssValue} forwards;`)
  lines.push(`}`)

  return lines.join('\n')
}

export function exportAllToJSON(scenes: SceneKeyframes[]): string {
  return JSON.stringify(scenes, null, 2)
}
