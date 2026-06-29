'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image_url: string | null
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: any) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Ajouter un produit au panier
  const addToCart = (product: any) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id)

      if (existingItem) {
        // Si le produit existe déjà, augmenter la quantité
        return currentCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Sinon, ajouter le produit avec quantité 1
        return [...currentCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url
        }]
      }
    })
  }

  // Supprimer un produit du panier
  const removeFromCart = (id: number) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id))
  }

  // Mettre à jour la quantité d'un produit
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return

    setCart(currentCart =>
      currentCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  // Vider le panier
  const clearCart = () => {
    setCart([])
  }

  // Calculer le nombre total d'articles
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Calculer le prix total
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook personnalisé pour utiliser le panier
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}