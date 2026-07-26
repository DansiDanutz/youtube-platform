export const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_BATCH_BYTES = 15 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);
const DATA_IMAGE_PREFIX = /^data:image\/(?:jpeg|png|webp);base64,/;
const MAX_DATA_IMAGE_CHARACTERS = 7 * 1024 * 1024;

export function isBoundedText(value, maximumLength) {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.length <= maximumLength;
}

export function isBoundedJsonValue(value, maximumLength) {
  if (!value || typeof value !== 'object') return false;

  try {
    return JSON.stringify(value).length <= maximumLength;
  } catch {
    return false;
  }
}

export function isFiniteNumberInRange(value, minimum, maximum) {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= minimum
    && value <= maximum;
}

export function isAllowedImageFile(file) {
  return Boolean(file)
    && ALLOWED_IMAGE_TYPES.has(file.type)
    && Number.isInteger(file.size)
    && file.size > 0
    && file.size <= MAX_IMAGE_FILE_BYTES;
}

export function isSafeImageSource(value) {
  if (typeof value !== 'string' || value.length === 0) return false;

  if (DATA_IMAGE_PREFIX.test(value)) {
    return value.length <= MAX_DATA_IMAGE_CHARACTERS;
  }

  if (value.length > 2048) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function isSafeIdentifier(value, maximumLength = 128) {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= maximumLength
    && /^[a-zA-Z0-9_-]+$/.test(value);
}

export function normalizeVoiceoverControls(config) {
  return {
    speed: config?.speed ?? 1,
    pitch: config?.pitch ?? 0,
    volume: config?.volume ?? 1,
  };
}
