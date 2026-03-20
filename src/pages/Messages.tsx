import { Link } from 'react-router-dom'
import { useConversationsViewModel } from '../ViewModels/useConversationsViewModel'

function Messages() {
  const { conversations, isLoading, error } = useConversationsViewModel()

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-slate-900">Messages</h1>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      {!isLoading && conversations.length === 0 && (
        <div className="text-center text-slate-400 py-16">
          <p className="text-4xl mb-3">💬</p>
          <p>Aucune conversation pour l'instant</p>
          <p className="text-sm mt-1">Visite le profil d'un créateur pour lui envoyer un message</p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        {conversations.map((conv) => (
          <Link
            key={conv.userId}
            to={`/messages/${conv.userId}`}
            state={{ username: conv.username, avatar: conv.avatar ?? null }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors"
          >
            {conv.avatar ? (
              <img
                src={conv.avatar}
                alt={conv.username}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">
                  {conv.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900">@{conv.username}</p>
              <p className="text-sm text-slate-400 truncate">
                {conv.lastMessage.type === 'file'
                  ? `📎 ${conv.lastMessage.fileName ?? 'Fichier'}`
                  : (conv.lastMessage.content ?? '')}
              </p>
            </div>
            <span className="text-xs text-slate-300 flex-shrink-0">
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
