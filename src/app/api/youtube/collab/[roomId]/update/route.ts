import { NextRequest, NextResponse } from 'next/server'
import { broadcast, heartbeat, type CollabEvent } from '@/lib/collab'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

  if (!body.userId || !body.type) {
    return NextResponse.json({ error: 'userId and type required' }, { status: 400 })
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
