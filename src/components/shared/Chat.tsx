import { API_URL } from 'astro:env/client'
import { SendHorizonal } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { format } from '@formkit/tempo'
import { useCallback, useEffect, useRef, useState } from 'react'

const StatusBar: React.FC<{
  connectionStatus: string
  threadOpen: boolean
  error: string | null
}> = ({ connectionStatus, threadOpen }) => {
  if (connectionStatus === 'connected') return null

  const getConnectionStatusText = useCallback((status: string) => {
    switch (status) {
      case 'connecting':
        return 'Conectando...'
      case 'connected':
        return 'Conectado'
      case 'disconnected':
        return 'Desconectado'
      case 'error':
        return 'Error de conexión'
      default:
        return ''
    }
  }, [])

  return (
    <div className="absolute w-full flex justify-center items-center">
      <div className="flex gap-2 mt-2 py-1 px-3 bg-black/5 dark:bg-white/5 rounded-sm">
        <span className="text-sm opacity-85 inline-flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected'
                ? 'bg-green-400'
                : connectionStatus === 'error'
                  ? 'bg-red-400'
                  : 'bg-contrast'
            }`}
          />
          <p>{getConnectionStatusText(connectionStatus)}</p>
          {threadOpen && connectionStatus !== 'connected' && (
            <button
              className="opacity-80 text-sm  decoration-contrast underline underline-offset-2 transition-opacity duration-200 hover:opacity-100"
              onClick={() => window.location.reload()}
            >
              Reconectar
            </button>
          )}
        </span>
      </div>
    </div>
  )
}

const URL = API_URL.replace('https', 'wss')

interface Message {
  content: string
  user: {
    id: string
    name: string
  }
  createdAt: Date
}

interface MessageEvent {
  type: 'new_message'
  message: Message
}

interface ErrorEvent {
  type: 'error'
  message: string
}

interface PreviousMessagesEvent {
  type: 'previous_messages'
  messages: Message[]
}

type WebSocketEvent = MessageEvent | ErrorEvent | PreviousMessagesEvent

interface Props {
  threadOpen: boolean
  prevMessages?: Message[]
  token: string
  userId: string
}

function Chat({ threadOpen, prevMessages, token, userId }: Props) {
  const [shouldConnect, setShouldConnect] = useState(true)
  const [messages, setMessages] = useState<Message[]>(prevMessages || [])
  const [inputMessage, setInputMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('disconnected')
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const scrollToBottom = (behavior: ScrollBehavior | undefined = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus('connecting')
    setError(null)

    try {
      wsRef.current = new WebSocket(`${URL}/threads/o/chat`, [`token-${token}`])

      wsRef.current.onopen = () => {
        setConnectionStatus('connected')
        setError(null)
        reconnectAttemptsRef.current = 0 // Reset contador de reintentos
        console.log('Conectado al chat')
      }

      wsRef.current.onmessage = event => {
        try {
          const data: WebSocketEvent = JSON.parse(event.data)
          if (data.type === 'error') {
            setError(data.message)
            setIsTyping(false) // Reset typing en caso de error
            return
          }

          if (data.type === 'new_message') {
            setMessages(prev => [...prev, data.message])
            if (data.message.user.id === userId) {
              setIsTyping(false)
            }
          }
        } catch (err) {
          console.error('Error parsing message:', err)
          setIsTyping(false)
        }
      }

      wsRef.current.onmessage

      wsRef.current.onclose = event => {
        setConnectionStatus('disconnected')
        setIsTyping(false) // Reset typing al desconectarse
        console.log('Conexión cerrada:', event.code, event.reason)

        if (event.code !== 1008 && shouldConnect) {
          // Implementar backoff exponencial para reconexión
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(
              1000 * Math.pow(2, reconnectAttemptsRef.current),
              30000
            )
            reconnectAttemptsRef.current++

            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, delay)
          } else {
            setError('No se pudo reconectar. Recarga la página.')
          }
        } else {
          setError('Sesión expirada')
        }
      }

      wsRef.current.onerror = error => {
        setConnectionStatus('error')
        setError('Error de conexión')
        setIsTyping(false)
        console.error('WebSocket error:', error)
      }
    } catch (err) {
      setConnectionStatus('error')
      setError('Error al conectar')
      setIsTyping(false)
      console.error('Connection error:', err)
    }
  }

  const disconnect = () => {
    setShouldConnect(false)
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setConnectionStatus('disconnected')
    setIsTyping(false)
  }

  const sendMessage = () => {
    if (
      !inputMessage.trim() ||
      connectionStatus !== 'connected' ||
      !wsRef.current
    ) {
      return
    }

    if (inputMessage.length > 240) {
      setError('Mensaje muy largo (máximo 240 caracteres)')
      return
    }

    setIsTyping(true)
    wsRef.current.send(inputMessage.trim())
    setInputMessage('')
    setError(null)

    // Fallback: resetear typing después de 5 segundos si no llega confirmación
    setTimeout(() => {
      setIsTyping(false)
    }, 5000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleChatClose = () => {
      setShouldConnect(false)
      disconnect()
    }

    document.addEventListener('chat:close', handleChatClose)
    return () => {
      document.removeEventListener('chat:close', handleChatClose)
    }
  }, [])

  useEffect(() => {
    if (shouldConnect) {
      connect()
    }

    return () => disconnect()
  }, [token])

  return (
    <div className="h-full overflow-hidden grid grid-rows-[1fr_auto] relative">
      <StatusBar
        connectionStatus={connectionStatus}
        threadOpen={threadOpen}
        error={error}
      />

      <div className="cborder bg-csecondary overflow-hidden flex flex-col">
        <ul className="p-2 flex-1 overflow-y-auto flex flex-col gap-y-4">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={`flex ${userId === msg.user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[85%]">
                <div>
                  <p
                    className={`${userId === msg.user.id ? 'text-right' : 'text-left'} `}
                  >
                    {msg.content}
                  </p>
                  <p
                    className={`text-xs opacity-70 inline-flex items-center gap-2 w-full ${userId === msg.user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <span
                      className={`${userId === msg.user.id ? 'hidden' : 'block'}`}
                    >
                      {msg.user.name.split(' ')[0]}
                    </span>
                    <span>
                      {format(
                        msg.createdAt,
                        { date: 'short', time: 'short' },
                        'es'
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
      </div>

      <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
        <Input
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Escribe tu mensaje..."
          disabled={connectionStatus !== 'connected'}
          maxLength={240}
        />
        <Button
          size="icon"
          onClick={sendMessage}
          disabled={
            !inputMessage.trim() || connectionStatus !== 'connected' || isTyping
          }
        >
          <SendHorizonal />
        </Button>
      </div>
    </div>
  )
}

export default Chat
