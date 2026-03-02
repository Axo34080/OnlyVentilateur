import { useBecomeCreatorViewModel } from "../ViewModels/useBecomeCreatorViewModel"

function BecomeCreator() {
  const { form, isSubmitting, error, handleChange, handleSubmit } = useBecomeCreatorViewModel()

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🌀</div>
        <h1 className="text-2xl font-bold text-slate-900">Devenir créateur</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Partage ta passion pour les ventilateurs et génère des revenus.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom d'affichage <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            placeholder="Ex : TurboFan2000"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Parle de toi et de tes ventilateurs préférés..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prix d'abonnement mensuel (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.subscriptionPrice}
            onChange={(e) => handleChange("subscriptionPrice", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
          <p className="text-xs text-slate-400 mt-1">Mets 0 pour un accès gratuit</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isSubmitting ? "Création en cours..." : "Créer mon espace créateur"}
        </button>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">Ce que tu vas pouvoir faire :</p>
        <ul className="list-disc list-inside flex flex-col gap-1 text-blue-600">
          <li>Publier des posts photos & vidéos</li>
          <li>Bloquer du contenu premium pour tes abonnés</li>
          <li>Suivre tes statistiques (abonnés, revenus)</li>
          <li>Vendre des goodies ventilateur dans la boutique</li>
        </ul>
      </div>
    </div>
  )
}

export default BecomeCreator
