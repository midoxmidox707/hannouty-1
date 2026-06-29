'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'

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
  profiles: { full_name: string; email: string }
  order_items: OrderItem[]
}

const STATUSES = [
  { value: 'pending',    label: 'En attente',   color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed',  label: 'Confirmée',    color: 'bg-blue-100 text-blue-700' },
  { value: 'delivering', label: 'En livraison', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered',  label: 'Livrée',       color: 'bg-green-100 text-green-700' },
  { value: 'cancelled',  label: 'Annulée',      color: 'bg-red-100 text-red-700' },
]

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
  .from('orders')
  .select(`
    id, created_at, status, total_amount, discount_amount,
    profiles ( full_name, email ),
    order_items (
      id, quantity, unit_price,
      products ( name, image_url )
    )
  `)
  .order('created_at', { ascending: false })

console.log('commandes:', data)
console.log('erreur:', error)

      setOrders((data as unknown as Order[]) || [])
      setLoading(false)
    }

    fetchOrders()
  }, [])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (!error) {
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      )
    }

    setUpdating(null)
  }

  const getStatus = (value: string) =>
    STATUSES.find(s => s.value === value) ?? { label: value, color: 'bg-gray-100 text-gray-600' }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"/>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Commandes
        <span className="ml-2 text-sm font-normal text-gray-400">
          ({orders.length} au total)
        </span>
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-400 py-20">Aucune commande pour l'instant</p>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const st = getStatus(order.status)
            const isOpen = expanded === order.id
            const isUpdating = updating === order.id

            return (
              <div key={order.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">

                {/* En-tête */}
                <div className="flex items-center justify-between px-5 py-4">
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="flex-1 flex items-center gap-4 text-left"
                  >
                    <div>
                      <p className="text-xs font-mono text-gray-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {order.profiles?.full_name || 'Client inconnu'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3">
                    {/* Sélecteur de statut */}
                    <select
                      value={order.status}
                      disabled={isUpdating}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-xs border rounded-lg px-2 py-1.5 font-medium cursor-pointer
                        ${st.color} ${isUpdating ? 'opacity-50' : ''}`}
                    >
                      {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>

                    <span className="text-sm font-bold text-gray-700 min-w-[80px] text-right">
                      {order.total_amount.toFixed(2)} MAD
                    </span>

                    <button
                      onClick={() => setExpanded(isOpen ? null : order.id)}
                      className="text-gray-400 text-sm w-6"
                    >
                      {isOpen ? '▲' : '▼'}
                    </button>
                  </div>
                </div>

                {/* Détail produits */}
                {isOpen && (
                  <div className="border-t bg-gray-50 px-5 py-4 space-y-3">
                    <p className="text-xs text-gray-400 mb-2">
                      📧 {order.profiles?.email}
                    </p>

                    {order.order_items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {item.products.name}
                          </p>
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
                        Réduction appliquée : -{order.discount_applied}%
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