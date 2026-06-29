'use client'

import { useCart } from '../context/CartContext'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    totalPrice 
  } = useCart()

  const [discount, setDiscount] = useState(0)
  const [levelName, setLevelName] = useState('')
  const [loading, setLoading] = useState(true)
  const [isOrdering, setIsOrdering] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Récupérer le niveau de l'utilisateur
  useEffect(() => {
    const fetchUserLevel = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('level_id, levels(name, discount_percent)')
          .eq('id', user.id)
          .single()

        if (profile && profile.levels) {
          const levelData = profile.levels as any
          setDiscount(levelData.discount_percent || 0)
          setLevelName(levelData.name || '')
        }
      }
      setLoading(false)
    }

    fetchUserLevel()
  }, [])

  const discountAmount = (totalPrice * discount) / 100
  const finalPrice = totalPrice - discountAmount

  // Fonction pour passer la commande
  const handleCheckout = async () => {
    if (cart.length === 0) return

    setIsOrdering(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert("Vous devez être connecté pour passer une commande.")
        router.push('/login')
        return
      }

      // 1. Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: totalPrice,
          discount_amount: discountAmount,
          final_amount: finalPrice,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Ajouter les produits dans order_items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Vider le panier
      clearCart()

      alert("Commande passée avec succès !")
      router.push('/profile')

    } catch (error: any) {
      alert("Erreur lors de la commande : " + error.message)
    } finally {
      setIsOrdering(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer vos achats.</p>
          <Link 
            href="/products" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Liste des produits */}
          <div className="divide-y">
            {cart.map((item) => (
              <div key={item.id} className="p-6 flex gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Pas d'image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-blue-600 font-bold mt-1">{item.price} €</p>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border rounded-lg">
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          updateQuantity(item.id, item.quantity - 1)
                        }}
                        className="px-3 py-1 hover:bg-gray-100 active:bg-gray-200"
                      >
                        −
                      </button>
                      <span className="px-4 py-1 border-x select-none">{item.quantity}</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault()
                          updateQuantity(item.id, item.quantity + 1)
                        }}
                        className="px-3 py-1 hover:bg-gray-100 active:bg-gray-200"
                      >
                        +
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">
                    {(item.price * item.quantity).toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé des prix */}
          <div className="border-t p-6 bg-gray-50">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction ({levelName} - {discount}%)</span>
                  <span>-{discountAmount.toFixed(2)} €</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold pt-2 border-t">
                <span>Total à payer</span>
                <span className="text-blue-600">{finalPrice.toFixed(2)} €</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={clearCart}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Vider le panier
              </button>
              <button 
                onClick={handleCheckout}
                disabled={isOrdering}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
              >
                {isOrdering ? "Commande en cours..." : "Passer la commande"}
              </button>
            </div>

            <Link 
              href="/products" 
              className="block text-center mt-4 text-blue-600 hover:underline"
            >
              ← Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}