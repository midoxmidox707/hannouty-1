'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

type Profile = {
  role: string
  full_name: string
  level?: { name: string }
}

export default function Navbar() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('role, full_name, levels(name)')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }

    fetchProfile()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return null

  // NAVBAR ADMIN
  if (profile?.role === 'admin') {
    return (
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 font-bold text-lg">🛠️ Hannouty</span>
          <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Admin</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/admin" className="hover:text-orange-400 transition">Dashboard</Link>
          <Link href="/admin/orders" className="hover:text-orange-400 transition">Commandes</Link>
          <Link href="/admin/products" className="hover:text-orange-400 transition">Produits</Link>
          <Link href="/admin/clients" className="hover:text-orange-400 transition">Clients</Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{profile.full_name}</span>
          <button
            onClick={handleLogout}
            className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition"
          >
            Déconnexion
          </button>
        </div>
      </nav>
    )
  }

  // NAVBAR CLIENT
  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
      <Link href="/" className="text-green-600 font-bold text-lg">🛒 Hannouty</Link>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <Link href="/products" className="hover:text-green-600 transition">Produits</Link>
        {profile && (
          <>
            <Link href="/orders" className="hover:text-green-600 transition">Mes commandes</Link>
            <Link href="/profile" className="hover:text-green-600 transition">Mon profil</Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {profile ? (
          <>
            {profile.level && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {profile.level.name}
              </span>
            )}
            <Link href="/cart" className="text-gray-600 hover:text-green-600 text-xl">🛒</Link>
            <button
              onClick={handleLogout}
              className="text-sm border border-gray-300 hover:border-red-400 hover:text-red-500 px-3 py-1.5 rounded-lg transition"
            >
              Déconnexion
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700 transition">
            Connexion
          </Link>
        )}
      </div>
    </nav>
  )
}