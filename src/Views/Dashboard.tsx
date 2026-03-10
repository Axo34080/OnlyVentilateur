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
      <div className="text-center py-16 text-slate-400">Chargement du dashboard...</div>
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
          <h1 className="text-2xl font-bold text-slate-900">Dashboard créateur</h1>
          {creator && (
            <p className="text-slate-400 text-sm">@{creator.username}</p>
          )}
        </div>
        <button
          onClick={() => navigate("/dashboard/new-post")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          + Nouveau post
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Posts" value={posts.length} />
        <StatCard label="Abonnés" value={creator?.subscriberCount ?? 0} />
        <StatCard label="Prix abonnement" value={`${creator?.subscriptionPrice ?? 0} €/mois`} />
        <StatCard label="Posts premium" value={posts.filter((p) => p.isLocked).length} />
      </div>

      {revenue > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-700">
          Revenu potentiel (contenu premium) : <strong>{revenue.toFixed(2)} €</strong>
        </div>
      )}

      {/* Liste des posts */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Mes posts</h2>
          <span className="text-xs text-slate-400">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
        </div>

        {posts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm mb-4">Tu n'as pas encore publié de post.</p>
            <button
              onClick={() => navigate("/dashboard/new-post")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Créer mon premier post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.map((post) => (
              <div key={post.id} className="px-6 py-4 flex items-center gap-4">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm truncate">{post.title}</span>
                    {post.isLocked && (
                      <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Premium {post.price ? `${post.price} €` : ""}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{post.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{post.likes} like{post.likes !== 1 ? "s" : ""}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/dashboard/edit-post/${post.id}`)}
                    className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer ce post ?")) handleDeletePost(post.id)
                    }}
                    className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
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
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Ma boutique</h2>
          <button
            onClick={handleNewGoodie}
            className="text-xs text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            + Ajouter un goodie
          </button>
        </div>

        {/* Formulaire ajout / édition */}
        {isFormOpen && (
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">
              {editingGoodieId ? "Modifier le goodie" : "Nouveau goodie"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="goodie-name" className="text-xs font-medium text-slate-600">Nom *</label>
                <input
                  id="goodie-name"
                  type="text"
                  value={goodieForm.name}
                  onChange={(e) => handleGoodieFormChange("name", e.target.value)}
                  placeholder="Ex : T-shirt TurboFan"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="goodie-price" className="text-xs font-medium text-slate-600">Prix (€) *</label>
                <input
                  id="goodie-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={goodieForm.price}
                  onChange={(e) => handleGoodieFormChange("price", e.target.value)}
                  placeholder="19.99"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="goodie-description" className="text-xs font-medium text-slate-600">Description</label>
                <input
                  id="goodie-description"
                  type="text"
                  value={goodieForm.description}
                  onChange={(e) => handleGoodieFormChange("description", e.target.value)}
                  placeholder="Description courte"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label htmlFor="goodie-image-url" className="text-xs font-medium text-slate-600">Image *</label>
                <div className="flex items-center gap-3">
                  {goodieForm.image && (
                    <img src={goodieForm.image} alt="preview" className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-100" />
                  )}
                  <div className="flex flex-col gap-2 flex-1">
                    <button
                      type="button"
                      onClick={() => goodieImageRef.current?.click()}
                      disabled={isUploadingGoodieImage}
                      className="border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors text-left disabled:opacity-50"
                    >
                      {isUploadingGoodieImage ? "Téléversement..." : "Choisir un fichier"}
                    </button>
                    <input
                      id="goodie-image-url"
                      type="text"
                      value={goodieForm.image}
                      onChange={(e) => handleGoodieFormChange("image", e.target.value)}
                      placeholder="ou coller une URL..."
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                <label htmlFor="goodie-variants" className="text-xs font-medium text-slate-600">
                  Variantes <span className="font-normal text-slate-400">(facultatif — séparées par des virgules)</span>
                </label>
                <input
                  id="goodie-variants"
                  type="text"
                  value={goodieForm.variants}
                  onChange={(e) => handleGoodieFormChange("variants", e.target.value)}
                  placeholder="Ex : S, M, L, XL, XXL  ou  Blanc, Noir, Gris"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={goodieForm.inStock}
                  onChange={(e) => handleGoodieFormChange("inStock", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="inStock" className="text-sm text-slate-700">En stock</label>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveGoodie}
                disabled={isSavingGoodie || isUploadingGoodieImage || !goodieForm.name || !goodieForm.price || !goodieForm.image}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
              >
                {isSavingGoodie ? "Enregistrement..." : editingGoodieId ? "Mettre à jour" : "Créer"}
              </button>
              <button
                onClick={handleCancelGoodie}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des goodies */}
        {goodiesLoading ? (
          <div className="px-6 py-8 text-center text-slate-400 text-sm">Chargement...</div>
        ) : goodies.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400 text-sm">Tu n'as pas encore de goodies dans ta boutique.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {goodies.map((goodie: Goodie) => (
              <div key={goodie.id} className="px-6 py-4 flex items-center gap-4">
                <img
                  src={goodie.image}
                  alt={goodie.name}
                  className="w-14 h-14 rounded-lg object-cover shrink-0 bg-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm truncate">{goodie.name}</span>
                    {!goodie.inStock && (
                      <span className="shrink-0 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Rupture</span>
                    )}
                  </div>
                  {goodie.description && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{goodie.description}</p>
                  )}
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{Number(goodie.price).toFixed(2)} €</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEditGoodie(goodie)}
                    className="text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Supprimer ce goodie ?")) handleDeleteGoodie(goodie.id)
                    }}
                    className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
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
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}

export default Dashboard
