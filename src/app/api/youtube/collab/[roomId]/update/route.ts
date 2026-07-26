import { NextRequest, NextResponse } from 'next/server'
import { broadcast, heartbeat, type CollabEvent } from '@/lib/collab'
import { isBoundedJsonValue, isSafeIdentifier } from '@/lib/api-guards.mjs'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const CLIENT_EVENT_TYPES = new Set<CollabEvent['type']>([
  'cursor_move',
  'scene_update',
  'script_update',
  'field_focus',
  'field_blur',
  'project_update',
])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params

  const body = await request.json() as {
    userId: string
    type: CollabEvent['type']
    payload?: Record<string, unknown>
  }

  if (
    !isSafeIdentifier(roomId, 64)
    || !isSafeIdentifier(body.userId, 64)
    || !CLIENT_EVENT_TYPES.has(body.type)
    || (body.payload !== undefined && !isBoundedJsonValue(body.payload, 32_768))
  ) {
    return NextResponse.json({ error: 'Invalid or oversized collaboration update' }, { status: 400 })
  }

  heartbeat(roomId, body.userId)

  const event: CollabEvent = {
    type: body.type,
    userId: body.userId,
    roomId,
    timestamp: Date.now(),
    payload: body.payload,
  }

  broadcast(event, body.userId)

  return NextResponse.json({ ok: true, timestamp: event.timestamp })
}
