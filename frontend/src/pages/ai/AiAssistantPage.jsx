import React, { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Bot, Send, User, Sparkles, AlertCircle, Loader } from 'lucide-react'
import { aiApi } from '../../api/index'
import { getErrorMessage } from '../../utils/formatters'

const SUGGESTED = [
  'Show me an asset summary',
  'Which warranties expire this month?',
  'How many assets are under repair?',
  'List available assets',
  'What are the high-risk assets?',
  'Assets assigned to HR department',
]

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: '👋 Hello! I\'m your AI Asset Management Assistant.\n\nI can help you with:\n- 📦 Finding available assets\n- ⚠️ Warranty and maintenance alerts\n- 📊 Asset statistics and summaries\n- 👤 Allocation status\n\nWhat would you like to know?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const mutation = useMutation({
    mutationFn: (message) => aiApi.chat(message).then(r => r.data),
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.message || data.data?.message || 'Sorry, I could not process that.',
        timestamp: new Date()
      }])
    },
    onError: (err) => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '❌ ' + getErrorMessage(err),
        timestamp: new Date(),
        isError: true
      }])
    }
  })

  const sendMessage = (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    setInput('')
    mutation.mutate(msg)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="page-header flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="page-title">AI Assistant</h1>
            <p className="page-subtitle flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Powered by Gemini — Ask anything about your assets
            </p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col card overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                       style={{ background: msg.isError ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {msg.isError ? <AlertCircle size={15} className="text-red-400" /> : <Bot size={15} className="text-white" />}
                  </div>
                )}
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  {msg.role === 'ai' ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                  <p className="text-xs mt-1.5 opacity-60">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-indigo-500">
                    <User size={15} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {mutation.isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Bot size={15} className="text-white" />
                </div>
                <div className="chat-bubble-ai flex items-center gap-2">
                  <Loader size={14} className="animate-spin text-indigo-500" />
                  <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your assets..."
                className="input flex-1 resize-none text-sm"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || mutation.isLoading}
                className="btn-primary p-2.5 rounded-xl flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'rgb(var(--text-muted))' }}>
              Press <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgb(var(--bg-elevated))' }}>Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'rgb(var(--bg-elevated))' }}>Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>

        {/* Suggested prompts */}
        <div className="w-56 flex-shrink-0 hidden xl:block">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-indigo-500" />
              <span className="text-xs font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>
                Suggested Questions
              </span>
            </div>
            <div className="space-y-2">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={mutation.isLoading}
                  className="w-full text-left text-xs px-3 py-2.5 rounded-lg border transition-all duration-150"
                  style={{
                    borderColor: 'rgb(var(--border-color))',
                    color: 'rgb(var(--text-secondary))',
                    background: 'rgb(var(--bg-elevated))',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#6366f1'
                    e.currentTarget.style.color = '#6366f1'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgb(var(--border-color))'
                    e.currentTarget.style.color = 'rgb(var(--text-secondary))'
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
