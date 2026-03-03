'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Users,
  Copy,
  Check,
  Wifi,
  WifiOff,
  Circle,
  Link2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { type CollabUser, type CollabEvent } from '@/lib/collab'

interface CollabSessionProps {
  roomId: string
  userId: string
  userName: string
  onEvent?: (event: CollabEvent) => void
  onSendEvent?: (send: (type: CollabEvent['type'], payload?: Record<string, unknown>) => void) => void
  currentSceneIndex?: number
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

export default function CollabSession({
  roomId,
  userId,
  userName,
  onEvent,
  onSendEvent,
  currentSceneIndex = 0,
}: CollabSessionProps) {
  const [users, setUsers] = useState<CollabUser[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting')
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [eventLog, setEventLog] = useState<Array<{ text: string; time: string }>>([])
  const esRef = useRef<EventSource | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sendEvent = useCallback(
    async (type: CollabEvent['type'], payload?: Record<string, unknown>) => {
      try {
        await fetch(`/api/youtube/collab/${roomId}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, type, payload }),
        })
      } catch {
        // silently ignore send failures
      }
    },
    [roomId, userId]
  )

  // Expose sendEvent to parent
  useEffect(() => {
    onSendEvent?.(sendEvent)
  }, [sendEvent, onSendEvent])

  // Broadcast cursor whenever sceneIndex changes
  useEffect(() => {
    if (connectionState === 'connected') {
      sendEvent('cursor_move', { sceneIndex: currentSceneIndex })
    }
  }, [currentSceneIndex, connectionState, sendEvent])

  const connect = useCallback(() => {
    if (esRef.current) esRef.current.close()
    setConnectionState('connecting')

    const url = `/api/youtube/collab/${roomId}/events?userId=${encodeURIComponent(userId)}&name=${encodeURIComponent(userName)}`
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => setConnectionState('connected')

    es.onmessage = (e) => {
      try {
        const event: CollabEvent = JSON.parse(e.data)

        if (event.type === 'ping') return

        if (event.type === 'presence') {
          const payload = event.payload as { users: CollabUser[]; you: CollabUser }
          setUsers(payload.users ?? [])
          return
        }

        if (event.type === 'user_join') {
          const user = (event.payload as { user: CollabUser }).user
          setUsers(prev => {
            const exists = prev.find(u => u.userId === user.userId)
            return exists ? prev.map(u => u.userId === user.userId ? user : u) : [...prev, user]
          })
          addLog(`${user.name} joined`)
          return
        }

        if (event.type === 'user_leave') {
          const uid = (event.payload as { userId: string }).userId
          setUsers(prev => prev.filter(u => u.userId !== uid))
          addLog(`Someone left`)
          return
        }

        if (event.type === 'cursor_move') {
          const { sceneIndex } = event.payload as { sceneIndex: number }
          setUsers(prev => prev.map(u =>
            u.userId === event.userId ? { ...u, sceneIndex } : u
          ))
        }

        if (event.type === 'field_focus') {
          const { field } = event.payload as { field: string }
          setUsers(prev => prev.map(u =>
            u.userId === event.userId ? { ...u, editingField: field } : u
          ))
        }

        if (event.type === 'field_blur') {
          setUsers(prev => prev.map(u =>
            u.userId === event.userId ? { ...u, editingField: null } : u
          ))
        }

        if (event.type === 'scene_update' || event.type === 'script_update' || event.type === 'project_update') {
          const other = users.find(u => u.userId === event.userId)
          addLog(`${other?.name ?? 'Someone'} updated ${event.type.replace('_update', '')}`)
        }

        onEvent?.(event)
      } catch {
        // malformed event
      }
    }

    es.onerror = () => {
      setConnectionState('disconnected')
      es.close()
      // Auto-reconnect after 3s
      reconnectTimer.current = setTimeout(connect, 3000)
    }
  }, [roomId, userId, userName, onEvent, users])

  useEffect(() => {
    connect()
    return () => {
      esRef.current?.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function addLog(text: string) {
    const time = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setEventLog(prev => [{ text, time }, ...prev].slice(0, 20))
  }

  const copyRoomLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const statusColor = {
    connecting: 'text-yellow-400',
    connected: 'text-green-400',
    disconnected: 'text-red-400',
    error: 'text-red-400',
  }[connectionState]

  const StatusIcon = connectionState === 'connected' ? Wifi : WifiOff
  const otherUsers = users.filter(u => u.userId !== userId)

  return (
    <div className="select-none">
      {/* Compact presence bar */}
      <div className="flex items-center gap-3 p-2 bg-gray-800/60 rounded-lg border border-gray-700">
        {/* Connection status */}
        <div className={`flex items-center gap-1 ${statusColor}`}>
          <StatusIcon className="w-3 h-3" />
          <span className="text-xs capitalize">{connectionState}</span>
        </div>

        <div className="w-px h-4 bg-gray-700" />

        {/* Presence avatars */}
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">{users.length}</span>
          <div className="flex -space-x-1 ml-1">
            {users.slice(0, 6).map(u => (
              <div
                key={u.userId}
                className="w-5 h-5 rounded-full border border-gray-900 flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: u.color }}
                title={`${u.name}${u.editingField ? ` (editing ${u.editingField})` : ''}`}
              >
                {u.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {users.length > 6 && (
              <div className="w-5 h-5 rounded-full bg-gray-700 border border-gray-900 flex items-center justify-center text-[9px] text-gray-300">
                +{users.length - 6}
              </div>
            )}
          </div>
        </div>

        {/* Room ID */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-500 font-mono">{roomId.slice(0, 8)}…</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={copyRoomLink}
            title="Copy invite link"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <Card className="mt-1 bg-gray-800/80 border-gray-700">
          <CardContent className="p-3 space-y-3">
            {/* Collaborators list */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium">Active Collaborators</p>
              <div className="space-y-1">
                {users.map(u => (
                  <div key={u.userId} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
                      style={{ backgroundColor: u.color }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-gray-200">{u.name}</span>
                    {u.userId === userId && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1">you</Badge>
                    )}
                    {u.editingField && (
                      <Badge className="text-[10px] py-0 px-1 bg-blue-900/40 text-blue-300 border-blue-700">
                        editing {u.editingField}
                      </Badge>
                    )}
                    <span className="text-[10px] text-gray-500 ml-auto">
                      Scene {u.sceneIndex + 1}
                    </span>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-xs text-gray-500">No one connected yet</p>
                )}
              </div>
            </div>

            {/* Invite link */}
            <div>
              <p className="text-xs text-gray-400 mb-1 font-medium">Invite Link</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-900 rounded px-2 py-1 text-xs font-mono text-gray-400 truncate flex items-center gap-1">
                  <Link2 className="w-3 h-3 shrink-0" />
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
                    : `?room=${roomId}`}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 shrink-0"
                  onClick={copyRoomLink}
                >
                  {copied ? <><Check className="w-3 h-3 mr-1" />Copied</> : <><Copy className="w-3 h-3 mr-1" />Copy</>}
                </Button>
              </div>
            </div>

            {/* Activity log */}
            {eventLog.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1 font-medium">Activity</p>
                <div className="space-y-0.5 max-h-28 overflow-y-auto">
                  {eventLog.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 font-mono shrink-0">{e.time}</span>
                      <span className="text-gray-400">{e.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Other users' scene badges (non-expanded) */}
      {!expanded && otherUsers.some(u => u.sceneIndex !== currentSceneIndex) && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {otherUsers
            .filter(u => u.sceneIndex !== currentSceneIndex)
            .map(u => (
              <span
                key={u.userId}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${u.color}22`, color: u.color, border: `1px solid ${u.color}44` }}
              >
                {u.name} → Scene {u.sceneIndex + 1}
              </span>
            ))}
        </div>
      )}
    </div>
  )
}
