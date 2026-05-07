import { Link } from 'react-router-dom'
import { useConversationsViewModel } from '../ViewModels/useConversationsViewModel'

function Messages() {
  const { conversations, isLoading, error } = useConversationsViewModel()

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-white">Messages</h1>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...new Array(4)].map((_, i) => (
            <div key={`msg-skeleton-${i}`} className="h-16 bg-[#1a1a1a] rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 px-4 py-3 rounded-lg">{error}</p>
      )}

      {!isLoading && conversations.length === 0 && (
        <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-12 text-center flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-[#2a2a2a]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          <p className="text-[#8a8a8a] text-sm">Aucune conversation pour l'instant</p>
          <p className="text-xs text-[#555]">Visite le profil d'un Ventilateur pour lui envoyer un message</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {conversations.map((conv) => (
          <Link
            key={conv.userId}
            to={`/messages/${conv.userId}`}
            state={{ username: conv.username, avatar: conv.avatar ?? null }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#111] transition-colors"
          >
            {conv.avatar ? (
              <img
                src={conv.avatar}
                alt={conv.username}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#00AFF0]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#00AFF0] font-bold text-lg">
                  {conv.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white">@{conv.username}</p>
              <p className="text-sm text-[#8a8a8a] truncate">
                {conv.lastMessage.type === 'file'
                  ? (conv.lastMessage.fileName ?? 'Fichier')
                  : (conv.lastMessage.content ?? '')}
              </p>
            </div>
            <span className="text-xs text-[#555] flex-shrink-0">
              {new Date(conv.lastMessage.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Messages
