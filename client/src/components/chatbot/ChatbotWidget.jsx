import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, X, Send, ExternalLink, Bot, Sparkles } from 'lucide-react'
import { api } from '@/utils/api'

const QUICK_QUESTIONS = [
  { emoji: '💰', label: 'Pricing', text: 'What is your pricing?' },
  { emoji: '🛠️', label: 'Services', text: 'What services do you offer?' },
  { emoji: '⏰', label: 'Timings', text: 'What are your business hours?' },
  { emoji: '📞', label: 'Contact', text: 'How can I contact you?' },
]

/* Renders plain text with **bold** and newline support — crash-safe */
function BotMessage({ text }) {
  if (!text || typeof text !== 'string') return null

  const lines = text.split('\n')
  return (
    <span>
      {lines.map((line, li) => {
        const parts = line.split(/\*\*(.*?)\*\*/g)
        return (
          <span key={li}>
            {parts.map((part, pi) =>
              pi % 2 === 1 ? (
                <strong key={pi}>{part}</strong>
              ) : (
                <span key={pi}>{part}</span>
              )
            )}
            {li < lines.length - 1 && <br />}
          </span>
        )
      })}
    </span>
  )
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 0,
      sender: 'bot',
      text: '👋 Hello! Welcome to **SnapTech Digital**. How can I help you today? Ask me about our services, pricing, timings, or contact info.',
      isAnswered: true,
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const msgIdRef = useRef(1)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200)
  }, [isOpen])

  const handleSend = async (text) => {
    const msg = (text || '').trim()
    if (!msg || isLoading) return

    const userMsgId = msgIdRef.current++
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: msg }])
    setInputValue('')
    setIsLoading(true)

    try {
      const data = await api.post('/chatbot/ask', { question: msg })
      const botAnswer = typeof data.answer === 'string' && data.answer
        ? data.answer
        : "I couldn't find an answer. Please contact us directly!"

      setMessages((prev) => [
        ...prev,
        {
          id: msgIdRef.current++,
          sender: 'bot',
          text: botAnswer,
          isAnswered: !!data.answered,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: msgIdRef.current++,
          sender: 'bot',
          text: "Sorry, I'm having trouble connecting right now. Please use our Contact form or WhatsApp us directly.",
          isAnswered: false,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const showQuickButtons = true

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ fontFamily: 'inherit' }}>

      {/* ── Toggle Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Chat Assistant"
          style={{ backgroundColor: '#1a3e8c', width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(26,62,140,0.4)', transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: '#1a3e8c', opacity: 0.35, animation: 'chatPing 1.5s ease-out infinite' }} />
          <MessageCircle style={{ width: 24, height: 24, color: '#fff', position: 'relative', zIndex: 1 }} />
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div style={{ width: 360, height: 520, backgroundColor: '#fff', borderRadius: 20, boxShadow: '0 10px 50px rgba(0,0,0,0.18)', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'chatSlideUp 0.2s ease-out' }}>

          {/* Header */}
          <div style={{ backgroundColor: '#1a3e8c', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot style={{ width: 20, height: 20, color: '#ffffff' }} />
              </div>
              <div>
                <p style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.3 }}>
                  SnapTech Digital
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, margin: 0, fontWeight: 500 }}>
                    Virtual Assistant • Online
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, transition: 'background 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: '#f8fafc' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>

                {/* Bot label */}
                {m.sender === 'bot' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1a3e8c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles style={{ width: 11, height: 11, color: '#fff' }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assistant</span>
                  </div>
                )}

                {/* Bubble */}
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: m.sender === 'user' ? '#1a3e8c' : '#ffffff',
                  color: m.sender === 'user' ? '#ffffff' : '#1f2937',
                  fontSize: 13,
                  lineHeight: 1.55,
                  border: m.sender === 'bot' ? '1px solid #e5e7eb' : 'none',
                  boxShadow: m.sender === 'bot' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  wordBreak: 'break-word',
                }}>
                  {m.sender === 'bot' ? <BotMessage text={m.text} /> : m.text}
                </div>

                {/* Fallback contact button */}
                {m.sender === 'bot' && m.isAnswered === false && (
                  <Link
                    to="/contact"
                    onClick={() => setIsOpen(false)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: '#dc2626', color: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none', marginTop: 2 }}
                  >
                    Open Contact Form <ExternalLink style={{ width: 11, height: 11 }} />
                  </Link>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1a3e8c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles style={{ width: 11, height: 11, color: '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: 5, padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px 18px 18px 4px' }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#1a3e8c', display: 'inline-block', animation: 'chatBounce 1s infinite', animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Buttons */}
          {showQuickButtons && (
            <div style={{ padding: '8px 12px 4px', backgroundColor: '#fff', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 4px' }}>Quick Questions:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q.text}
                    onClick={() => handleSend(q.text)}
                    style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1a3e8c', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a3e8c'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a3e8c' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; e.currentTarget.style.color = '#1a3e8c'; e.currentTarget.style.borderColor = '#bfdbfe' }}
                  >
                    {q.emoji} {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(inputValue) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', backgroundColor: '#fff', borderTop: '1px solid #e5e7eb', flexShrink: 0 }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question here..."
              style={{ flex: 1, fontSize: 13, padding: '9px 14px', borderRadius: 12, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#1f2937', outline: 'none', transition: 'border 0.15s' }}
              onFocus={(e) => { e.target.style.borderColor = '#1a3e8c'; e.target.style.backgroundColor = '#fff' }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc' }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              style={{ width: 40, height: 40, borderRadius: 12, border: 'none', backgroundColor: inputValue.trim() && !isLoading ? '#1a3e8c' : '#e5e7eb', color: inputValue.trim() && !isLoading ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'background 0.15s' }}
            >
              <Send style={{ width: 16, height: 16 }} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPing {
          0%   { transform: scale(1); opacity: 0.35; }
          70%  { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes chatBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
