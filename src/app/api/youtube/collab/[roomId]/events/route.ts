import { NextRequest, NextResponse } from 'next/server'
import {
  joinRoom,
  leaveRoom,
  heartbeat,
  getPresence,
  broadcast,
  subscribe,
  getEventLog,
  toSSE,
  type CollabEvent,
} from '@/lib/collab'
import { isBoundedText, isSafeIdentifier } from '@/lib/api-guards.mjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params
  const { searchParams } = new URL(request.url)
  const requestedUserId = searchParams.get('userId')
  const userId = requestedUserId || `user_${Math.random().toString(36).slice(2, 8)}`
  const name = searchParams.get('name') || `User ${userId.slice(-4)}`

  if (
    !isSafeIdentifier(roomId, 64)
    || (requestedUserId !== null && !isSafeIdentifier(requestedUserId, 64))
    || !isBoundedText(name, 80)
  ) {
    return NextResponse.json({ error: 'Invalid collaboration session' }, { status: 400 })
  }

  const user = joinRoom(roomId, userId, name)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial presence snapshot
      const presence = getPresence(roomId)
      const presenceEvent: CollabEvent = {
        type: 'presence',
        userId: 'server',
        roomId,
        timestamp: Date.now(),
        payload: { users: presence, you: user },
      }
      controller.enqueue(encoder.encode(toSSE(presenceEvent)))

      // Replay recent event log for catchup
      const log = getEventLog(roomId)
      for (const e of log.slice(-10)) {
        controller.enqueue(encoder.encode(toSSE(e)))
      }

      // Broadcast join to everyone else
      const joinEvent: CollabEvent = {
        type: 'user_join',
        userId,
        roomId,
        timestamp: Date.now(),
        payload: { user },
      }
      broadcast(joinEvent, userId)

      // Subscribe to future events
      const unsubscribe = subscribe(roomId, (event) => {
        try {
          controller.enqueue(encoder.encode(toSSE(event)))
        } catch {
          // Client disconnected
        }
      })

      // Heartbeat every 20s to keep connection alive
      const pingInterval = setInterval(() => {
        heartbeat(roomId, userId)
        try {
          const ping: CollabEvent = {
            type: 'ping',
            userId: 'server',
            roomId,
            timestamp: Date.now(),
          }
          controller.enqueue(encoder.encode(toSSE(ping)))
        } catch {
          clearInterval(pingInterval)
        }
      }, 20_000)

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval)
        unsubscribe()
        leaveRoom(roomId, userId)
        const leaveEvent: CollabEvent = {
          type: 'user_leave',
          userId,
          roomId,
          timestamp: Date.now(),
          payload: { userId },
        }
        broadcast(leaveEvent)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
