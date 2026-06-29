'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import { useCart } from '../context/CartContext'

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  stock_quantity: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addedMessage, setAddedMessage] = useState('')
  
  const { addToCart } = useCart()
  const supabase = createClient()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (data) {
        setProducts(data)
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  // Fonction pour ajouter au panier
  const handleAddToCart = (product: Product) => {
    addToCart(product)
    setAddedMessage(`${product.name} ajouté au panier !`)
    
    // Effacer le message après 2 secondes
    setTimeout(() => {
      setAddedMessage('')
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement des produits...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Nos Produits</h1>

        {/* Message de confirmation */}
        {addedMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-center">
            {addedMessage}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">Pas d'image</div>
                  )}
                </div>

                {/* Infos produit */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description || 'Aucune description'}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {product.price} €
                    </span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}