import { useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChatViewModel } from '../ViewModels/useChatViewModel'
import VideoCallModal from '../components/VideoCallModal'

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
    videoRoomUrl,
    incomingCall,
    callError,
    startVideoCall,
    closeVideoCall,
    acceptIncomingCall,
    rejectIncomingCall,
    bottomRef,
    currentUserId,
    otherUsername,
    otherAvatar,
  } = useChatViewModel(userId ?? '')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendText()
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate('/messages')}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          ←
        </button>
        {otherAvatar ? (
          <img src={otherAvatar} alt={otherUsername ?? ''} className="w-8 h-8 rounded-full object-cover" />
        ) : otherUsername ? (
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
            {otherUsername.charAt(0).toUpperCase()}
          </div>
        ) : null}
        <span className="font-semibold text-slate-900 flex-1">
          {otherUsername ? `@${otherUsername}` : 'Conversation'}
        </span>
        <button
          onClick={startVideoCall}
          title="Démarrer un appel vidéo"
          className="text-slate-400 hover:text-blue-500 transition-colors text-xl"
        >
          📹
        </button>
      </div>

      {callError && (
        <p className="text-xs text-red-500 text-center py-1">{callError}</p>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-2">
        {isLoading && (
          <div className="flex flex-col gap-2 px-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-10 rounded-2xl bg-slate-100 animate-pulse ${i % 2 === 0 ? 'w-2/3' : 'w-1/2 self-end'}`}
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
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                }`}
              >
                {msg.type === 'file' && msg.content ? (
                  <a
                    href={msg.content}
                    download={msg.fileName ?? 'fichier'}
                    className={`flex items-center gap-2 underline ${isMine ? 'text-blue-100' : 'text-blue-600'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>📎</span>
                    <span>{msg.fileName ?? 'Télécharger'}</span>
                  </a>
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
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${fileProgress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-center">Envoi du fichier... {fileProgress}%</p>
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-slate-400 hover:text-blue-500 transition-colors text-xl pb-1"
          title="Envoyer un fichier"
        >
          📎
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
          placeholder="Votre message..."
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm"
        />
        <button
          onClick={sendText}
          disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
        >
          Envoyer
        </button>
      </div>

      {/* Incoming call banner */}
      {incomingCall && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-4 z-50">
          <span className="text-2xl">📹</span>
          <p className="text-sm font-medium text-slate-900">Appel vidéo entrant</p>
          <button
            onClick={acceptIncomingCall}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-xl text-sm font-semibold"
          >
            Accepter
          </button>
          <button
            onClick={rejectIncomingCall}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-xl text-sm font-semibold"
          >
            Refuser
          </button>
        </div>
      )}

      {/* Video call modal */}
      {videoRoomUrl && (
        <VideoCallModal roomUrl={videoRoomUrl} onClose={closeVideoCall} />
      )}
    </div>
  )
}

export default Chat
