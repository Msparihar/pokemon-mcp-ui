"use client"

import { useState, useEffect, useRef, useCallback } from "react"

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

interface UseWebSocketReturn {
  connectionStatus: ConnectionStatus
  sendMessage: (message: string) => void
  lastMessage: string | null
  error: string | null
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = useRef(1000)

  const connect = useCallback(() => {
    try {
      setConnectionStatus("connecting")
      setError(null)

      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        setConnectionStatus("connected")
        setError(null)
        reconnectAttempts.current = 0
        reconnectDelay.current = 1000
      }

      ws.current.onmessage = (event) => {
        setLastMessage(event.data)
      }

      ws.current.onclose = (event) => {
        setConnectionStatus("disconnected")

        if (!event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, 10000)

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectDelay.current)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError("Failed to connect after multiple attempts. Please check your connection.")
          setConnectionStatus("error")
        }
      }

      ws.current.onerror = () => {
        setError("WebSocket connection error")
        setConnectionStatus("error")
      }
    } catch (err) {
      setError("Failed to create WebSocket connection")
      setConnectionStatus("error")
    }
  }, [url])

  const sendMessage = useCallback((message: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(message)
    } else {
      setError("Cannot send message: WebSocket is not connected")
    }
  }, [])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  return {
    connectionStatus,
    sendMessage,
    lastMessage,
    error,
  }
}
