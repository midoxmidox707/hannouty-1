'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import Link from 'next/link'

type Stats = {
  totalOrders: number
  totalRevenue: number
  totalClients: number
  pendingOrders: number
}

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalClients: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      // Total commandes
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

      // Chiffre d'affaires
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')

      const totalRevenue = revenueData?.reduce(
        (sum, o) => sum + (o.total_amount || 0), 0
      ) || 0

      // Total clients
      const { count: totalClients } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client')

      // Commandes en attente
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // 5 dernières commandes
      const { data: recent } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalClients: totalClients || 0,
        pendingOrders: pendingOrders || 0,
      })
      setRecentOrders(recent || [])
      setLoading(false)
    }

    fetchStats()
  }, [])

  const STATUS: Record<string, { label: string; color: string }> = {
    pending:    { label: 'En attente',   color: 'bg-yellow-100 text-yellow-700' },
    confirmed:  { label: 'Confirmée',    color: 'bg-blue-100 text-blue-700' },
    delivering: { label: 'En livraison', color: 'bg-purple-100 text-purple-700' },
    delivered:  { label: 'Livrée',       color: 'bg-green-100 text-green-700' },
    cancelled:  { label: 'Annulée',      color: 'bg-red-100 text-red-700' },
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"/>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-400 mb-1">Commandes</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-400 mb-1">Chiffre d'affaires</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalRevenue.toFixed(0)}
            <span className="text-sm font-normal text-gray-400 ml-1">MAD</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-400 mb-1">Clients</p>
          <p className="text-3xl font-bold text-gray-800">{stats.totalClients}</p>
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <p className="text-sm text-gray-400 mb-1">En attente</p>
          <p className="text-3xl font-bold text-orange-500">{stats.pendingOrders}</p>
        </div>
      </div>

      {/* Dernières commandes */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-800">Dernières commandes</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-orange-500 hover:text-orange-600 transition"
          >
            Voir tout →
          </Link>
        </div>

        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucune commande</p>
          ) : (
            recentOrders.map(order => {
              const st = STATUS[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
              return (
                <div key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-mono text-gray-500">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-700">
                      {order.profiles?.full_name || 'Client inconnu'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color}`}>
                      {st.label}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {order.total_amount.toFixed(2)} MAD
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}