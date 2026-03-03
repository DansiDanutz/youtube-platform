// Real-time Collaboration — in-memory room state + SSE broadcast
// No external deps required: works with Next.js App Router SSE

export type CollabUserColor =
  | '#818CF8' | '#34D399' | '#F472B6' | '#FBBF24' | '#60A5FA'
  | '#A78BFA' | '#FB923C' | '#4ADE80'

const USER_COLORS: CollabUserColor[] = [
  '#818CF8', '#34D399', '#F472B6', '#FBBF24',
  '#60A5FA', '#A78BFA', '#FB923C', '#4ADE80',
]

export interface CollabUser {
  userId: string
  name: string
  color: CollabUserColor
  sceneIndex: number       // which scene they're viewing
  editingField: string | null  // 'script' | 'scene-0' | 'title' | null
  lastSeen: number         // Date.now()
  isActive: boolean
}

export type CollabEventType =
  | 'presence'         // full presence list
  | 'user_join'
  | 'user_leave'
  | 'cursor_move'      // user changed active scene
  | 'scene_update'     // scene description or prompt changed
  | 'script_update'    // script text changed
  | 'field_focus'      // user started editing a field
  | 'field_blur'       // user stopped editing a field
  | 'project_update'   // full project snapshot (title, style, etc.)
  | 'ping'

export interface CollabEvent {
  type: CollabEventType
  userId: string
  roomId: string
  timestamp: number
  payload?: Record<string, unknown>
}

// ── In-memory room registry ──────────────────────────────────────────────────

interface Room {
  roomId: string
  users: Map<string, CollabUser>
  colorIndex: number
  subscribers: Set<(event: CollabEvent) => void>
  // rolling event log (last 50 events) for new joiners
  eventLog: CollabEvent[]
}

// Global room map (persists for process lifetime)
const rooms = new Map<string, Room>()

const STALE_TIMEOUT = 30_000  // 30s no ping = user gone

function getRoom(roomId: string): Room {
  let room = rooms.get(roomId)
  if (!room) {
    room = { roomId, users: new Map(), colorIndex: 0, subscribers: new Set(), eventLog: [] }
    rooms.set(roomId, room)
  }
  return room
}

function nextColor(room: Room): CollabUserColor {
  const color = USER_COLORS[room.colorIndex % USER_COLORS.length]
  room.colorIndex++
  return color
}

function pruneStale(room: Room) {
  const now = Date.now()
  for (const [uid, user] of room.users) {
    if (now - user.lastSeen > STALE_TIMEOUT) {
      room.users.delete(uid)
    }
  }
}

export function joinRoom(roomId: string, userId: string, name: string): CollabUser {
  const room = getRoom(roomId)
  pruneStale(room)

  let user = room.users.get(userId)
  if (!user) {
    user = {
      userId,
      name,
      color: nextColor(room),
      sceneIndex: 0,
      editingField: null,
      lastSeen: Date.now(),
      isActive: true,
    }
    room.users.set(userId, user)
  } else {
    user.lastSeen = Date.now()
    user.isActive = true
  }
  return user
}

export function leaveRoom(roomId: string, userId: string) {
  const room = rooms.get(roomId)
  if (!room) return
  room.users.delete(userId)
  if (room.users.size === 0) rooms.delete(roomId)
}

export function heartbeat(roomId: string, userId: string) {
  const room = rooms.get(roomId)
  if (!room) return
  const user = room.users.get(userId)
  if (user) user.lastSeen = Date.now()
}

export function getPresence(roomId: string): CollabUser[] {
  const room = rooms.get(roomId)
  if (!room) return []
  pruneStale(room)
  return Array.from(room.users.values())
}

export function broadcast(event: CollabEvent, excludeUserId?: string) {
  const room = rooms.get(event.roomId)
  if (!room) return

  // Append to rolling log
  room.eventLog.push(event)
  if (room.eventLog.length > 50) room.eventLog.shift()

  // Notify all SSE subscribers except the sender
  for (const cb of room.subscribers) {
    try { cb(event) } catch { /* subscriber disconnected */ }
  }
}

export function subscribe(roomId: string, cb: (event: CollabEvent) => void): () => void {
  const room = getRoom(roomId)
  room.subscribers.add(cb)
  return () => room.subscribers.delete(cb)
}

export function getEventLog(roomId: string): CollabEvent[] {
  return rooms.get(roomId)?.eventLog ?? []
}

// Format as SSE data line
export function toSSE(event: CollabEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}
