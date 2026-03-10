import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { getGoodieById, goodieToCartItem } from "../services/goodiesService"
import type { Goodie } from "../services/goodiesService"

function GoodieDetail() {
  const { id } = useParams<{ id: string }>()
  const { addItem, items } = useCart()
  const [goodie, setGoodie] = useState<Goodie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getGoodieById(id)
      .then(setGoodie)
      .catch(() => setError("Goodie introuvable."))
      .finally(() => setIsLoading(false))
  }, [id])

  const hasVariants = (goodie?.variants?.length ?? 0) > 0
  const needsVariant = hasVariants && !selectedVariant

  const handleAddToCart = () => {
    if (!goodie || needsVariant) return
    addItem(goodieToCartItem(goodie, selectedVariant ?? undefined))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="flex gap-8">
          <div className="w-80 aspect-square bg-slate-200 rounded-2xl animate-pulse" />
          <div className="flex-1 flex flex-col gap-4">
            <div className="h-7 w-2/3 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
            <div className="h-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !goodie) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 mb-4">{error ?? "Goodie introuvable."}</p>
        <Link to="/shop" className="text-blue-600 hover:underline text-sm">← Retour à la boutique</Link>
      </div>
    )
  }

  const cartKey = selectedVariant ? `${goodie.id}|${selectedVariant}` : goodie.id
  const inCart = items.find((i) => i.cartKey === cartKey)

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <Link to="/shop" className="text-sm text-slate-400 hover:text-slate-700 transition-colors w-fit">
        ← Retour à la boutique
      </Link>

      <div className="flex flex-col sm:flex-row gap-8">
        <img
          src={goodie.image}
          alt={goodie.name}
          className="w-full sm:w-80 aspect-square object-cover rounded-2xl bg-slate-100 shrink-0"
        />

        <div className="flex flex-col gap-4 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{goodie.name}</h1>
            {goodie.creator && (
              <p className="text-sm text-slate-400 mt-1">
                par{" "}
                <Link
                  to={`/creators/${goodie.creatorId}`}
                  className="text-blue-600 hover:underline"
                >
                  {goodie.creator.displayName}
                </Link>
              </p>
            )}
          </div>

          {goodie.description && (
            <p className="text-slate-600 text-sm leading-relaxed">{goodie.description}</p>
          )}

          {/* Sélecteur de variante */}
          {hasVariants && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                {goodie.variants![0].match(/^(S|M|L|XL|XXL|S\/M|L\/XL)$/)
                  ? "Taille"
                  : "Coloris"}
                {selectedVariant && (
                  <span className="ml-2 font-semibold text-slate-900">{selectedVariant}</span>
                )}
              </span>
              <div className="flex gap-2 flex-wrap">
                {goodie.variants!.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                      selectedVariant === v
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {needsVariant && (
                <p className="text-xs text-amber-600">Sélectionne une option avant d'ajouter au panier.</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-100">
            <span className="text-3xl font-bold text-slate-900">{Number(goodie.price).toFixed(2)} €</span>

            {goodie.inStock ? (
              <button
                onClick={handleAddToCart}
                disabled={needsVariant}
                className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  added
                    ? "bg-green-100 text-green-700"
                    : inCart
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {added ? "Ajouté !" : inCart ? `Dans le panier (×${inCart.quantity})` : "Ajouter au panier"}
              </button>
            ) : (
              <span className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 text-slate-400">
                Rupture de stock
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoodieDetail
