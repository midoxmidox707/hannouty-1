'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'

type OrderItem = {
  id: string
  quantity: number
  unit_price: number
  products: { name: string; image_url: string }
}

type Order = {
  id: string
  created_at: string
  status: string
  total_amount: number
  discount_applied: number
  order_items: OrderItem[]
}

const STATUS: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',    color: 'bg-yellow-100 text-yellow-700' },
  confirmed:  { label: 'Confirmée',     color: 'bg-blue-100 text-blue-700' },
  delivering: { label: 'En livraison',  color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Livrée ✅',     color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Annulée ❌',    color: 'bg-red-100 text-red-700' },
}

export default function MyOrdersPage() {
  const supabase = createClient()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('orders')
        .select(`
          id, created_at, status, total_amount, discount_applied,
          order_items (
            id, quantity, unit_price,
            products ( name, image_url )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders((data as unknown as Order[]) || [])
      setLoading(false)
    }

    fetchOrders()
  }, [])

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"/>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Mes Commandes</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🛍️</p>
          <p className="text-lg mb-4">Aucune commande pour l'instant</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
          >
            Voir les produits
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const st = STATUS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
            const isOpen = expanded === order.id

            return (
              <div key={order.id} className="border rounded-xl shadow-sm overflow-hidden">

                {/* En-tête de la commande */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition"
                >
                  <div className="text-left">
                    <p className="text-xs text-gray-400 font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="font-bold text-green-700">
                      {order.total_amount.toFixed(2)} MAD
                    </span>
                    <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Détail des produits */}
                {isOpen && (
                  <div className="border-t bg-gray-50 p-4 space-y-3">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.products.name}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantity} × {item.unit_price.toFixed(2)} MAD
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          {(item.quantity * item.unit_price).toFixed(2)} MAD
                        </p>
                      </div>
                    ))}

                    {order.discount_applied > 0 && (
                      <p className="text-right text-sm text-green-600 font-medium pt-2 border-t">
                        Réduction fidélité : -{order.discount_applied}%
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}