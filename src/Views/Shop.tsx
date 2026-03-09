import { Link } from "react-router-dom"
import { useShopViewModel } from "../ViewModels/useShopViewModel"
import { useCart } from "../context/CartContext"

function Shop() {
  const {
    filter, creators, filteredGoodies, addedId, isLoading, isCheckingOut, checkoutSuccess,
    handleFilter, handleAddToCart, handleCheckout,
  } = useShopViewModel()
  const { items, totalItems, totalPrice, removeItem, updateQuantity } = useCart()

  if (checkoutSuccess) {
    return (
      <div className="max-w-lg mx-auto text-center flex flex-col gap-4 mt-16">
        <div className="text-6xl">🎉</div>
        <h1 className="text-2xl font-bold text-slate-900">Commande confirmée !</h1>
        <p className="text-slate-500 text-sm">
          Merci pour ton achat. Tes goodies ventilateur arrivent bientôt (simulation).
        </p>
        <a href="/shop" className="text-blue-600 hover:underline text-sm">
          Continuer mes achats
        </a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Boutique goodies</h1>
        <p className="text-slate-400 text-sm mt-1">Les meilleurs goodies ventilateur de tes créateurs préférés</p>
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
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grille produits */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Chargement des goodies...</div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGoodies.map((goodie) => {
              const inCart = items.find((i) => i.id === goodie.id)
              const wasAdded = addedId === goodie.id

              return (
                <div
                  key={goodie.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col"
                >
                  <Link to={`/shop/${goodie.id}`}>
                    <img
                      src={goodie.image}
                      alt={goodie.name}
                      className="w-full aspect-square object-cover bg-slate-100 hover:opacity-90 transition-opacity"
                    />
                  </Link>
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div>
                      <Link to={`/shop/${goodie.id}`} className="font-semibold text-slate-900 text-sm leading-tight hover:text-blue-600 transition-colors">
                        {goodie.name}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">par {goodie.creator}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-slate-900">{goodie.price.toFixed(2)} €</span>
                      <button
                        onClick={() => handleAddToCart(goodie)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          wasAdded
                            ? "bg-green-100 text-green-700"
                            : inCart
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {wasAdded ? "Ajouté !" : inCart ? `Encore (×${inCart.quantity})` : "Ajouter"}
                      </button>
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
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Panier</h2>
              {totalItems > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Ton panier est vide</p>
            ) : (
              <>
                <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
                        >
                          −
                        </button>
                        <span className="text-xs w-4 text-center text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-6 h-6 rounded-md text-slate-300 hover:text-red-500 text-xs flex items-center justify-center ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="font-bold text-slate-900">{totalPrice.toFixed(2)} €</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {isCheckingOut ? "Traitement en cours..." : "Commander"}
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
