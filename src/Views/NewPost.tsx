import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useNewPostViewModel } from "../ViewModels/useNewPostViewModel"

function NewPost() {
  const { form, isEditing, isSubmitting, isUploadingImage, error, handleChange, handleImageFileChange, handleSubmit } = useNewPostViewModel()
  const navigate = useNavigate()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editOrCreateLabel = isEditing ? "Mettre à jour le courant" : "Lancer la rafale"
  const submitLabel = isSubmitting ? "Mise en souffle..." : editOrCreateLabel

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-[#8a8a8a] hover:text-white transition-colors"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? "Modifier le courant d'air" : "Nouveau courant d'air"}
        </h1>
      </div>

      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-6 flex flex-col gap-4">
        <div>
          <label htmlFor="post-title" className="block text-sm font-medium text-[#8a8a8a] mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="post-title"
            type="text"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Mon Dyson TP09 tourne à plein régime !"
            className="input-of"
          />
        </div>

        <div>
          <label htmlFor="post-description" className="block text-sm font-medium text-[#8a8a8a] mb-1">Description</label>
          <textarea
            id="post-description"
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Décris ta rafale du jour..."
            rows={4}
            className="input-of resize-none"
          />
        </div>

        <div>
          <label htmlFor="post-image-file" className="block text-sm font-medium text-[#8a8a8a] mb-1">
            Image <span className="text-red-500">*</span>
          </label>

          {/* File picker */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            aria-label="Choisir un fichier image"
            className="w-full px-4 py-2.5 rounded-lg border-2 border-dashed border-[#2a2a2a] hover:border-[#00AFF0] text-[#8a8a8a] hover:text-[#00AFF0] text-sm transition-colors disabled:opacity-50 bg-[#0a0a0a]"
          >
            {isUploadingImage ? "Téléversement en cours..." : "Choisir un fichier image"}
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
            <div className="flex-1 h-px bg-[#2a2a2a]" />
            <span className="text-xs text-[#555]">ou URL</span>
            <div className="flex-1 h-px bg-[#2a2a2a]" />
          </div>
          <input
            type="url"
            value={form.image}
            onChange={(e) => handleChange("image", e.target.value)}
            placeholder="https://..."
            className="input-of"
          />

          {form.image && (
            <img
              src={form.image}
              alt="Aperçu"
              className="mt-2 h-40 w-full object-cover rounded-lg bg-[#1a1a1a]"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
            />
          )}
        </div>

        <div>
          <label htmlFor="post-tags" className="block text-sm font-medium text-[#8a8a8a] mb-1">
            Fréquences de rotation <span className="text-[#555] font-normal">(séparées par des virgules)</span>
          </label>
          <input
            id="post-tags"
            type="text"
            value={form.tags}
            onChange={(e) => handleChange("tags", e.target.value)}
            placeholder="dyson, turbo, brise-douce, ouragan"
            className="input-of"
          />
        </div>

        {/* Section premium */}
        <div className="border-t border-[#2a2a2a] pt-4">
          <label htmlFor="post-locked" aria-label="Mode Haute Pression" className="flex items-center gap-3 cursor-pointer">
            <input
              id="post-locked"
              type="checkbox"
              checked={form.isLocked}
              onChange={(e) => handleChange("isLocked", e.target.checked)}
              className="w-4 h-4 accent-[#00AFF0] rounded focus:ring-[#00AFF0]"
            />
            <div>
              <span className="font-medium text-white text-sm">Mode Haute Pression</span>
              <p className="text-xs text-[#555]">Réservé à tes Souffleurs abonnés</p>
            </div>
          </label>

          {form.isLocked && (
            <div className="mt-3">
              <label htmlFor="post-price" className="block text-sm font-medium text-[#8a8a8a] mb-1">
                Prix à l'unité — Souffle Premium (€)
              </label>
              <input
                id="post-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Laisser vide = inclus dans ton Souffle mensuel"
                className="input-of"
              />
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/50 px-4 py-2.5 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage}
            className="flex-1 bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {submitLabel}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#2a2a2a] hover:bg-[#333] text-[#8a8a8a] hover:text-white font-semibold px-5 py-3 rounded-lg transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewPost
