import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChatViewModel } from '../ViewModels/useChatViewModel'
import { useCall } from '../context/CallContext'

function Chat() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    isLoading,
    text,
    setText,
    sendText,
    sendFile,
    fileProgress,
    bottomRef,
    currentUserId,
    otherUsername,
    otherAvatar,
  } = useChatViewModel(userId ?? '')

  const { startCall } = useCall()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendText()
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[#2a2a2a]">
        <button
          onClick={() => navigate('/messages')}
          className="text-[#8a8a8a] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        {otherAvatar ? (
          <img src={otherAvatar} alt={otherUsername ?? ''} className="w-8 h-8 rounded-full object-cover" />
        ) : otherUsername ? (
          <div className="w-8 h-8 rounded-full bg-[#00AFF0]/10 flex items-center justify-center text-xs font-bold text-[#00AFF0]">
            {otherUsername.charAt(0).toUpperCase()}
          </div>
        ) : null}
        <span className="font-semibold text-white flex-1">
          {otherUsername ? `@${otherUsername}` : 'Conversation'}
        </span>
        <button
          onClick={() => startCall(userId ?? '', otherUsername, otherAvatar)}
          title="Démarrer un appel vidéo"
          className="text-[#8a8a8a] hover:text-[#00AFF0] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2">
        {isLoading && (
          <div className="flex flex-col gap-2 px-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-10 rounded-2xl bg-[#1a1a1a] animate-pulse ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 self-end'}`}
              />
            ))}
          </div>
        )}

        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-4`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-[#00AFF0] text-white rounded-br-sm'
                    : 'bg-[#1a1a1a] text-white rounded-bl-sm border border-[#2a2a2a]'
                }`}
              >
                {msg.type === 'file' && msg.content ? (
                  /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(msg.fileName ?? '') ? (
                    <img
                      src={msg.content}
                      alt={msg.fileName ?? ''}
                      className="max-w-[220px] rounded-lg cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  ) : /\.(mp4|webm|ogg|mov)$/i.test(msg.fileName ?? '') ? (
                    <video
                      src={msg.content}
                      controls
                      className="max-w-[220px] rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <a
                      href={msg.content}
                      download={msg.fileName ?? 'fichier'}
                      className={`flex items-center gap-2 underline ${isMine ? 'text-white/80' : 'text-[#00AFF0]'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                      <span>{msg.fileName ?? 'Télécharger'}</span>
                    </a>
                  )
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* File progress */}
      {fileProgress !== null && (
        <div className="px-4 pb-2">
          <div className="w-full bg-[#2a2a2a] rounded-full h-1.5">
            <div
              className="bg-[#00AFF0] h-1.5 rounded-full transition-all"
              style={{ width: `${fileProgress}%` }}
            />
          </div>
          <p className="text-xs text-[#8a8a8a] mt-1 text-center">Envoi du fichier... {fileProgress}%</p>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 pt-3 border-t border-[#2a2a2a]">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[#8a8a8a] hover:text-[#00AFF0] transition-colors pb-1"
          title="Envoyer un fichier"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) sendFile(file)
            e.target.value = ''
          }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ton message..."
          rows={1}
          className="input-of resize-none text-sm py-2.5 rounded-2xl flex-1"
        />
        <button
          onClick={sendText}
          disabled={!text.trim()}
          className="bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-40 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
        >
          Envoyer
        </button>
      </div>

    </div>
  )
}

export default Chat
