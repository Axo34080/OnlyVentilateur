import { Link } from "react-router-dom"
import { useShopViewModel } from "../ViewModels/useShopViewModel"
import { useCart } from "../context/CartContext"

function Shop() {
  const {
    filter, creators, filteredGoodies, addedId, isLoading, isCheckingOut, checkoutSuccess, checkoutError,
    handleFilter, handleAddToCart, handleCheckout,
  } = useShopViewModel()
  const { items, totalItems, totalPrice, removeItem, updateQuantity } = useCart()

  if (checkoutSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center flex flex-col items-center gap-4 mt-16">
        <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Commande confirmée !</h1>
        <p className="text-[#8a8a8a] text-sm">
          Merci pour ton achat. Tes goodies ventilateur arrivent bientôt (simulation).
        </p>
        <a href="/shop" className="text-[#00AFF0] hover:underline text-sm">
          Continuer mes achats
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Boutique goodies</h1>
        <p className="text-[#8a8a8a] text-sm mt-1">Les meilleurs goodies ventilateur de tes Ventilateurs préférés</p>
      </div>

      <div className="flex gap-8 items-start">
        {/* Catalogue */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Filtres par créateur */}
          <div className="flex gap-2 flex-wrap">
            {creators.map((c) => (
              <button
                key={c}
                onClick={() => handleFilter(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === c
                    ? "bg-[#00AFF0] text-white"
                    : "bg-[#1a1a1a] border border-[#2a2a2a] text-[#8a8a8a] hover:border-[#00AFF0]/50 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grille produits */}
          {isLoading ? (
            <div className="text-center py-12 text-[#8a8a8a]">Chargement des goodies...</div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredGoodies.map((goodie) => {
              const inCart = items.find((i) => i.id === goodie.id)
              const wasAdded = addedId === goodie.id

              return (
                <div
                  key={goodie.id}
                  className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden flex flex-col"
                >
                  <Link to={`/shop/${goodie.id}`}>
                    <img
                      src={goodie.image}
                      alt={goodie.name}
                      className="w-full aspect-square object-cover bg-[#111] hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div>
                      <Link to={`/shop/${goodie.id}`} className="font-semibold text-white text-sm leading-tight hover:text-[#00AFF0] transition-colors">
                        {goodie.name}
                      </Link>
                      <p className="text-xs text-[#555] mt-0.5">par {goodie.creator}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-white">{goodie.price.toFixed(2)} €</span>
                      {goodie.variants && goodie.variants.length > 0 ? (
                        <Link
                          to={`/shop/${goodie.id}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors bg-[#2a2a2a] text-[#8a8a8a] hover:bg-[#333] hover:text-white"
                        >
                          Choisir
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(goodie)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                            wasAdded
                              ? "bg-green-900/30 text-green-400"
                              : inCart
                              ? "bg-[#00AFF0]/10 text-[#00AFF0] border border-[#00AFF0]/30"
                              : "bg-[#00AFF0] text-white hover:bg-[#0099CC]"
                          }`}
                        >
                          {wasAdded ? "Ajouté !" : inCart ? `Encore (×${inCart.quantity})` : "Ajouter"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>

        {/* Panier */}
        <div className="w-72 shrink-0 sticky top-4">
          <div className="bg-[#111] rounded-2xl border border-[#2a2a2a] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white">Panier</h2>
              {totalItems > 0 && (
                <span className="bg-[#00AFF0] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-[#8a8a8a] text-center py-4">Ton panier est vide</p>
            ) : (
              <>
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[#1a1a1a]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{item.name}</p>
                        {item.variant && (
                          <p className="text-xs text-[#00AFF0] font-medium">{item.variant}</p>
                        )}
                        <p className="text-xs text-[#555]">{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-[#2a2a2a] hover:bg-[#333] text-white text-xs font-bold flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-xs w-4 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-[#2a2a2a] hover:bg-[#333] text-white text-xs font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.cartKey)}
                          className="w-6 h-6 rounded-md text-[#555] hover:text-red-400 text-xs flex items-center justify-center ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#1f1f1f] pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#8a8a8a]">Total</span>
                    <span className="font-bold text-white">{totalPrice.toFixed(2)} €</span>
                  </div>
                  {checkoutError && (
                    <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/50 rounded-lg px-3 py-2 mb-2">
                      {checkoutError}
                    </p>
                  )}
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-[#00AFF0] hover:bg-[#0099CC] disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {isCheckingOut ? "Redirection vers le paiement..." : "Commander"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop
