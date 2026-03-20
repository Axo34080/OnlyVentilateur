import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useDashboardViewModel } from "../ViewModels/useDashboardViewModel"
import type { Goodie } from "../services/goodiesService"

function Dashboard() {

  const {
    creator, posts, isLoading, error, handleDeletePost,
    goodies, goodiesLoading, goodieForm, editingGoodieId, newGoodieOpen, isSavingGoodie,
    isUploadingGoodieImage, handleGoodieImageFile,
    handleGoodieFormChange, handleEditGoodie, handleCancelGoodie,
    handleSaveGoodie, handleDeleteGoodie, handleNewGoodie,
  } = useDashboardViewModel()
  const goodieImageRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="text-center py-16 text-[#8a8a8a]">Chargement du tableau de bord...</div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">{error}</div>
    )
  }

  const revenue = posts
    .filter((p) => p.isLocked && p.price)
    .reduce((sum, p) => sum + (p.price ?? 0), 0)

  const isFormOpen = editingGoodieId !== null || newGoodieOpen

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau de bord des Ventilateurs</h1>
          {creator && (
            <p className="text-[#8a8a8a] text-sm">@{creator.username}</p>
          )}
        </div>
        <button
          onClick={() => navigate("/dashboard/new-post")}
          className="bg-[#00AFF0] hover:bg-[#0099CC] text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          + Nouveau courant d'air
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Rafales publiées" value={posts.length} />
        <StatCard label="Souffleurs" value={creator?.subscriberCount ?? 0} />
        <StatCard label="Tarif Souffle" value={`${creator?.subscriptionPrice ?? 0} €/mois`} />
        <StatCard label="Mode Haute Pression" value={posts.filter((p) => p.isLocked).length} />
      </div>

      {revenue > 0 && (
        <div className="bg-green-900/20 border border-green-800/50 rounded-xl px-5 py-3 text-sm text-green-400">
          Pression revenue estimée : <strong>{revenue.toFixed(2)} €</strong>
        </div>
      )}

      {/* Liste des posts */}
      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a]">
        <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <h2 className="font-bold text-white">Mes courants d'air</h2>
          <span className="text-xs text-[#555]">{posts.length} rafale{posts.length !== 1 ? "s" : ""}</span>
        </div>

        {posts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[#8a8a8a] text-sm mb-4">Aucune rafale publiée pour le moment.</p>
            <button
              onClick={() => navigate("/dashboard/new-post")}
              className="bg-[#00AFF0] hover:bg-[#0099CC] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Lancer ma première rafale
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1f1f1f]">
            {posts.map((post) => (
              <div key={post.id} className="px-6 py-4 flex items-center gap-4">
                <img
                  src={post.image ?? ""}
                  alt={post.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-[#1a1a1a]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm truncate">{post.title}</span>
                    {post.isLocked && (
                      <span className="shrink-0 text-xs bg-[#00AFF0]/10 text-[#00AFF0] px-2 py-0.5 rounded-full">
                        Haute Pression {post.price ? `${post.price} €` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#555] truncate mt-0.5">{post.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[#555]">
                    <span>{post.likes} rafale{post.likes !== 1 ? "s" : ""}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/dashboard/edit-post/${post.id}`)}
                    className="text-xs text-[#8a8a8a] hover:text-[#00AFF0] border border-[#2a2a2a] hover:border-[#00AFF0]/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer ce post ?")) handleDeletePost(post.id)
                    }}
                    className="text-xs text-[#8a8a8a] hover:text-red-500 border border-[#2a2a2a] hover:border-red-800/50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ma boutique */}
      <div className="bg-[#111] rounded-2xl border border-[#2a2a2a]">
        <div className="px-6 py-4 border-b border-[#1f1f1f] flex items-center justify-between">
          <h2 className="font-bold text-white">Ma boutique</h2>
          <button
            onClick={handleNewGoodie}
            className="text-xs text-[#00AFF0] hover:text-white border border-[#00AFF0]/30 hover:border-[#00AFF0] px-3 py-1.5 rounded-lg transition-colors"
          >
            + Ajouter un goodie
          </button>
        </div>

        {/* Formulaire ajout / édition */}
        {isFormOpen && (
          <div className="px-6 py-5 border-b border-[#1f1f1f] bg-[#1a1a1a]">
            <h3 className="font-semibold text-white text-sm mb-4">
              {editingGoodieId ? "Modifier le goodie" : "Nouveau goodie"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="goodie-name" className="text-xs font-medium text-[#8a8a8a]">Nom *</label>
                <input
                  id="goodie-name"
                  type="text"
                  value={goodieForm.name}
                  onChange={(e) => handleGoodieFormChange("name", e.target.value)}
                  placeholder="Ex : T-shirt TurboFan"
                  className="input-of text-sm py-2 px-3"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="goodie-price" className="text-xs font-medium text-[#8a8a8a]">Prix (€) *</label>
                <input
                  id="goodie-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={goodieForm.price}
                  onChange={(e) => handleGoodieFormChange("price", e.target.value)}
                  placeholder="19.99"
                  className="input-of text-sm py-2 px-3"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="goodie-description" className="text-xs font-medium text-[#8a8a8a]">Description</label>
                <input
                  id="goodie-description"
                  type="text"
                  value={goodieForm.description}
                  onChange={(e) => handleGoodieFormChange("description", e.target.value)}
                  placeholder="Description courte"
                  className="input-of text-sm py-2 px-3"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="goodie-image-url" className="text-xs font-medium text-[#8a8a8a]">Image *</label>
                <div className="flex items-center gap-3">
                  {goodieForm.image && (
                    <img src={goodieForm.image} alt="preview" className="w-14 h-14 rounded-lg object-cover shrink-0 bg-[#1a1a1a]" />
                  )}
                  <div className="flex flex-col gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => goodieImageRef.current?.click()}
                      disabled={isUploadingGoodieImage}
                      className="border border-[#2a2a2a] hover:border-[#00AFF0]/30 rounded-lg px-3 py-2 text-sm text-[#8a8a8a] hover:text-[#00AFF0] transition-colors text-left disabled:opacity-50 bg-[#111]"
                    >
                      {isUploadingGoodieImage ? "Téléversement..." : "Choisir un fichier"}
                    </button>
                    <input
                      id="goodie-image-url"
                      type="text"
                      value={goodieForm.image}
                      onChange={(e) => handleGoodieFormChange("image", e.target.value)}
                      placeholder="ou coller une URL..."
                      className="input-of text-sm py-2 px-3"
                    />
                  </div>
                </div>
                <input
                  ref={goodieImageRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGoodieImageFile(f); e.target.value = "" }}
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="goodie-variants" className="text-xs font-medium text-[#8a8a8a]">
                  Variantes <span className="font-normal text-[#555]">(facultatif — séparées par des virgules)</span>
                </label>
                <input
                  id="goodie-variants"
                  type="text"
                  value={goodieForm.variants}
                  onChange={(e) => handleGoodieFormChange("variants", e.target.value)}
                  placeholder="Ex : S, M, L, XL, XXL  ou  Blanc, Noir, Gris"
                  className="input-of text-sm py-2 px-3"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={goodieForm.inStock}
                  onChange={(e) => handleGoodieFormChange("inStock", e.target.checked)}
                  className="w-4 h-4 rounded accent-[#00AFF0]"
                />
                <label htmlFor="inStock" className="text-sm text-[#ccc]">En stock</label>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveGoodie}
                disabled={isSavingGoodie || isUploadingGoodieImage || !goodieForm.name || !goodieForm.price || !goodieForm.image}
                className="bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
              >
                {isSavingGoodie ? "Enregistrement..." : editingGoodieId ? "Mettre à jour" : "Créer"}
              </button>
              <button
                onClick={handleCancelGoodie}
                className="text-sm text-[#8a8a8a] hover:text-white transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des goodies */}
        {goodiesLoading ? (
          <div className="px-6 py-8 text-center text-[#8a8a8a] text-sm">Chargement...</div>
        ) : goodies.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[#8a8a8a] text-sm">Tu n'as pas encore de goodies dans ta boutique.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1f1f1f]">
            {goodies.map((goodie: Goodie) => (
              <div key={goodie.id} className="px-6 py-4 flex items-center gap-4">
                <img
                  src={goodie.image}
                  alt={goodie.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-[#1a1a1a]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm truncate">{goodie.name}</span>
                    {!goodie.inStock && (
                      <span className="shrink-0 text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full">Rupture de souffle</span>
                    )}
                  </div>
                  {goodie.description && (
                    <p className="text-xs text-[#555] truncate mt-0.5">{goodie.description}</p>
                  )}
                  <p className="text-sm font-bold text-white mt-0.5">{Number(goodie.price).toFixed(2)} €</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEditGoodie(goodie)}
                    className="text-xs text-[#8a8a8a] hover:text-[#00AFF0] border border-[#2a2a2a] hover:border-[#00AFF0]/30 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer ce goodie ?")) handleDeleteGoodie(goodie.id)
                    }}
                    className="text-xs text-[#8a8a8a] hover:text-red-500 border border-[#2a2a2a] hover:border-red-800/50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#111] rounded-xl border border-[#2a2a2a] p-4">
      <p className="text-xs text-[#555] mb-1">{label}</p>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}

export default Dashboard
