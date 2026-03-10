import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useNewPostViewModel } from "../ViewModels/useNewPostViewModel"

function NewPost() {
  const { form, isEditing, isSubmitting, isUploadingImage, error, handleChange, handleImageFileChange, handleSubmit } = useNewPostViewModel()
  const navigate = useNavigate()
  const imageInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditing ? "Modifier le post" : "Nouveau post"}
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4">
        <div>
          <label htmlFor="post-title" className="block text-sm font-medium text-slate-700 mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="post-title"
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Mon ventilateur Dyson TP09 arrive !"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="post-description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            id="post-description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Parle de ton contenu..."
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
          />
        </div>

        <div>
          <label htmlFor="post-image-file" className="block text-sm font-medium text-slate-700 mb-1">
            Image <span className="text-red-500">*</span>
          </label>

          {/* File picker */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            aria-label="Choisir un fichier image"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-500 text-sm transition-colors disabled:opacity-50"
          >
            {isUploadingImage ? "Téléversement..." : "Choisir un fichier image"}
          </button>
          <input
            id="post-image-file"
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageFileChange(file)
              e.target.value = ""
            }}
          />

          {/* URL fallback */}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">ou URL</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <input
            type="url"
            value={form.image}
            onChange={(e) => handleChange("image", e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />

          {form.image && (
            <img
              src={form.image}
              alt="Aperçu"
              className="mt-2 h-40 w-full object-cover rounded-lg bg-slate-100"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          )}
        </div>

        <div>
          <label htmlFor="post-tags" className="block text-sm font-medium text-slate-700 mb-1">
            Tags <span className="text-slate-400 font-normal">(séparés par des virgules)</span>
          </label>
          <input
            id="post-tags"
            type="text"
            value={form.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            placeholder="dyson, silencieux, tower-fan"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        {/* Section premium */}
        <div className="border-t border-slate-100 pt-4">
          <label htmlFor="post-locked" aria-label="Contenu premium (verrouillé)" className="flex items-center gap-3 cursor-pointer">
            <input
              id="post-locked"
              type="checkbox"
              checked={form.isLocked}
              onChange={(e) => handleChange("isLocked", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-slate-900 text-sm">Contenu premium (verrouillé)</span>
              <p className="text-xs text-slate-400">Seuls tes abonnés pourront voir ce post</p>
            </div>
          </label>

          {form.isLocked && (
            <div className="mt-3">
              <label htmlFor="post-price" className="block text-sm font-medium text-slate-700 mb-1">
                Prix unitaire optionnel (€)
              </label>
              <input
                id="post-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Laisser vide = inclus dans l'abonnement"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isSubmitting
              ? "Sauvegarde..."
              : isEditing
              ? "Sauvegarder les modifications"
              : "Publier le post"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewPost
