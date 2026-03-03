// Multi-Language Voice Library

export interface Language {
  code: string          // BCP-47 e.g. 'en-US'
  name: string
  nativeName: string
  flag: string
  region: string
}

export interface VoicePreset {
  id: string
  name: string
  languageCode: string
  gender: 'male' | 'female' | 'neutral'
  style: 'natural' | 'news' | 'cheerful' | 'empathetic' | 'calm' | 'energetic'
  ageGroup: 'young' | 'adult' | 'mature'
  // ElevenLabs voice IDs (if available)
  elevenLabsId?: string
  // Web Speech API voice name hints
  webSpeechHint?: string
  // OpenAI TTS voice name
  openAiVoice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
  sampleText?: string
}

export interface VoiceoverConfig {
  languageCode: string
  voiceId: string
  speed: number       // 0.5 – 2.0 (1.0 = normal)
  pitch: number       // -10 – +10 semitones (0 = normal)
  volume: number      // 0.0 – 1.0
  pauseBetweenSentences: number  // ms
  emphasizeWords: string[]
}

// ── Languages ────────────────────────────────────────────────────────────────

export const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English', flag: '🇺🇸', region: 'Americas' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧', region: 'Europe' },
  { code: 'en-AU', name: 'English (AU)', nativeName: 'English', flag: '🇦🇺', region: 'Oceania' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', flag: '🇪🇸', region: 'Europe' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español', flag: '🇲🇽', region: 'Americas' },
  { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Europe' },
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Europe' },
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Europe' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', flag: '🇧🇷', region: 'Americas' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', flag: '🇵🇹', region: 'Europe' },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', region: 'Europe' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Europe' },
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Europe' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Europe' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Europe' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Europe' },
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Asia' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'Asia' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文', flag: '🇨🇳', region: 'Asia' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文', flag: '🇹🇼', region: 'Asia' },
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'Asia' },
  { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Middle East' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Asia' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Asia' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭', region: 'Asia' },
]

// ── Voice Presets (per language) ─────────────────────────────────────────────

export const VOICE_PRESETS: VoicePreset[] = [
  // English US
  { id: 'en-us-aria', name: 'Aria', languageCode: 'en-US', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova', elevenLabsId: 'EXAVITQu4vr4xnSDxMaL', webSpeechHint: 'Samantha' },
  { id: 'en-us-ryan', name: 'Ryan', languageCode: 'en-US', gender: 'male', style: 'natural', ageGroup: 'adult', openAiVoice: 'echo', elevenLabsId: 'VR6AewLTigWG4xSOukaG', webSpeechHint: 'Alex' },
  { id: 'en-us-nova', name: 'Nova', languageCode: 'en-US', gender: 'female', style: 'energetic', ageGroup: 'young', openAiVoice: 'shimmer', webSpeechHint: 'Zoe' },
  { id: 'en-us-onyx', name: 'Onyx', languageCode: 'en-US', gender: 'male', style: 'calm', ageGroup: 'mature', openAiVoice: 'onyx', webSpeechHint: 'Fred' },
  { id: 'en-us-fable', name: 'Fable', languageCode: 'en-US', gender: 'neutral', style: 'cheerful', ageGroup: 'young', openAiVoice: 'fable', webSpeechHint: 'Samantha' },
  // English UK
  { id: 'en-gb-emma', name: 'Emma', languageCode: 'en-GB', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova', webSpeechHint: 'Kate' },
  { id: 'en-gb-oliver', name: 'Oliver', languageCode: 'en-GB', gender: 'male', style: 'news', ageGroup: 'adult', openAiVoice: 'echo', webSpeechHint: 'Daniel' },
  // Spanish
  { id: 'es-es-sofia', name: 'Sofía', languageCode: 'es-ES', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova', webSpeechHint: 'Monica' },
  { id: 'es-es-pablo', name: 'Pablo', languageCode: 'es-ES', gender: 'male', style: 'natural', ageGroup: 'adult', openAiVoice: 'echo', webSpeechHint: 'Jorge' },
  { id: 'es-mx-valeria', name: 'Valeria', languageCode: 'es-MX', gender: 'female', style: 'cheerful', ageGroup: 'young', openAiVoice: 'shimmer', webSpeechHint: 'Paulina' },
  // French
  { id: 'fr-fr-camille', name: 'Camille', languageCode: 'fr-FR', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova', webSpeechHint: 'Amélie' },
  { id: 'fr-fr-hugo', name: 'Hugo', languageCode: 'fr-FR', gender: 'male', style: 'calm', ageGroup: 'adult', openAiVoice: 'onyx', webSpeechHint: 'Thomas' },
  // German
  { id: 'de-de-hannah', name: 'Hannah', languageCode: 'de-DE', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova', webSpeechHint: 'Anna' },
  { id: 'de-de-felix', name: 'Felix', languageCode: 'de-DE', gender: 'male', style: 'news', ageGroup: 'adult', openAiVoice: 'echo', webSpeechHint: 'Markus' },
  // Romanian
  { id: 'ro-ro-ana', name: 'Ana', languageCode: 'ro-RO', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova', webSpeechHint: 'Ioana' },
  { id: 'ro-ro-dan', name: 'Dan', languageCode: 'ro-RO', gender: 'male', style: 'natural', ageGroup: 'adult', openAiVoice: 'echo', webSpeechHint: 'Ioana' },
  // Portuguese
  { id: 'pt-br-julia', name: 'Júlia', languageCode: 'pt-BR', gender: 'female', style: 'cheerful', ageGroup: 'young', openAiVoice: 'shimmer', webSpeechHint: 'Luciana' },
  { id: 'pt-br-miguel', name: 'Miguel', languageCode: 'pt-BR', gender: 'male', style: 'natural', ageGroup: 'adult', openAiVoice: 'echo' },
  // Japanese
  { id: 'ja-jp-akari', name: 'Akari', languageCode: 'ja-JP', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova', webSpeechHint: 'Kyoko' },
  { id: 'ja-jp-kenji', name: 'Kenji', languageCode: 'ja-JP', gender: 'male', style: 'calm', ageGroup: 'adult', openAiVoice: 'onyx', webSpeechHint: 'Otoya' },
  // Chinese
  { id: 'zh-cn-xiaoxiao', name: 'Xiaoxiao', languageCode: 'zh-CN', gender: 'female', style: 'cheerful', ageGroup: 'young', openAiVoice: 'shimmer', webSpeechHint: 'Ting-Ting' },
  { id: 'zh-cn-yunxi', name: 'Yunxi', languageCode: 'zh-CN', gender: 'male', style: 'natural', ageGroup: 'adult', openAiVoice: 'echo', webSpeechHint: 'Ting-Ting' },
  // Korean
  { id: 'ko-kr-seo', name: 'Seo-Yeon', languageCode: 'ko-KR', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova', webSpeechHint: 'Yuna' },
  // Hindi
  { id: 'hi-in-swara', name: 'Swara', languageCode: 'hi-IN', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'shimmer' },
  { id: 'hi-in-arjun', name: 'Arjun', languageCode: 'hi-IN', gender: 'male', style: 'natural', ageGroup: 'adult', openAiVoice: 'echo' },
  // Russian
  { id: 'ru-ru-darya', name: 'Darya', languageCode: 'ru-RU', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova' },
  { id: 'ru-ru-dmitri', name: 'Dmitri', languageCode: 'ru-RU', gender: 'male', style: 'calm', ageGroup: 'adult', openAiVoice: 'onyx' },
  // Arabic
  { id: 'ar-sa-layla', name: 'Layla', languageCode: 'ar-SA', gender: 'female', style: 'natural', ageGroup: 'adult', openAiVoice: 'nova' },
  { id: 'ar-sa-omar', name: 'Omar', languageCode: 'ar-SA', gender: 'male', style: 'natural', ageGroup: 'adult', openAiVoice: 'echo' },
]

export function getVoicesForLanguage(languageCode: string): VoicePreset[] {
  return VOICE_PRESETS.filter(v => v.languageCode === languageCode)
}

export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(l => l.code === code)
}

export const DEFAULT_CONFIG: VoiceoverConfig = {
  languageCode: 'en-US',
  voiceId: 'en-us-aria',
  speed: 1.0,
  pitch: 0,
  volume: 1.0,
  pauseBetweenSentences: 300,
  emphasizeWords: [],
}

export const STYLE_LABELS: Record<VoicePreset['style'], string> = {
  natural: 'Natural',
  news: 'News',
  cheerful: 'Cheerful',
  empathetic: 'Empathetic',
  calm: 'Calm',
  energetic: 'Energetic',
}

export const STYLE_COLORS: Record<VoicePreset['style'], string> = {
  natural: 'bg-blue-900/40 text-blue-300',
  news: 'bg-gray-700 text-gray-300',
  cheerful: 'bg-yellow-900/40 text-yellow-300',
  empathetic: 'bg-pink-900/40 text-pink-300',
  calm: 'bg-teal-900/40 text-teal-300',
  energetic: 'bg-orange-900/40 text-orange-300',
}
