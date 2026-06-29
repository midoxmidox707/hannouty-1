'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [level, setLevel] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Récupérer le profil avec le niveau
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, levels(*)')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setLevel(profileData.levels)
      }
      
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Se déconnecter
            </button>
          </div>

          {/* Informations utilisateur */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Informations</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Nom :</strong> {profile?.full_name || 'Non renseigné'}</p>
              <p><strong>Email :</strong> {profile?.email}</p>
              <p><strong>Téléphone :</strong> {profile?.phone || 'Non renseigné'}</p>
            </div>
          </div>

          {/* Niveau de fidélité */}
          <div className="mb-8 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">Niveau actuel</p>
                <h3 className="text-4xl font-bold">{level?.name || 'Bronze'}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">Réduction</p>
                <p className="text-3xl font-bold">{level?.discount_percent || 0}%</p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">Commandes effectuées</p>
              <p className="text-3xl font-bold mt-2">{profile?.total_orders || 0}</p>
            </div>
            <div className="p-6 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">Total dépensé</p>
              <p className="text-3xl font-bold mt-2">
                {profile?.total_spent || 0} €
              </p>
            </div>
          </div>

          {/* Progression vers le niveau suivant */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-2">
              Progression vers le niveau suivant
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(((profile?.total_orders || 0) / 5) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile?.total_orders || 0} / 5 commandes pour le niveau Argent
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}