"use client"

import { Button } from "@/components/ui/button"
import { Copy, User, Bot, Clock, CheckCircle, XCircle } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  status: "sent" | "delivered" | "error"
}

interface MessageListProps {
  messages: Message[]
  onCopyMessage: (content: string) => void
}

export function MessageList({ messages, onCopyMessage }: MessageListProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusIcon = (status: Message["status"]) => {
    switch (status) {
      case "sent":
        return <Clock className="h-3 w-3 text-muted-foreground" />
      case "delivered":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "error":
        return <XCircle className="h-3 w-3 text-red-500" />
    }
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
          {message.sender === "assistant" && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            </div>
          )}

          <div className={`max-w-[70%] ${message.sender === "user" ? "order-2" : ""}`}>
            <div
              className={`rounded-lg px-4 py-2 ${
                message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {message.sender === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    code: ({ children }) => (
                      <code className="bg-muted-foreground/20 px-1 py-0.5 rounded text-sm">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted-foreground/20 p-2 rounded mt-2 overflow-x-auto">{children}</pre>
                    ),
                  }}
                >
                  {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            <div
              className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <span>{formatTime(message.timestamp)}</span>
              {message.sender === "user" && getStatusIcon(message.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyMessage(message.content)}
                className="h-auto p-1 hover:bg-muted"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {message.sender === "user" && (
            <div className="flex-shrink-0 order-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
