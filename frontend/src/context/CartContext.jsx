import { createContext, useContext, useState, useEffect } from 'react'
const CartContext = createContext()
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('ttx-cart')) || [] } catch { return [] } })
  const [isCartOpen, setIsCartOpen] = useState(false)
  useEffect(() => { localStorage.setItem('ttx-cart', JSON.stringify(items)) }, [items])
  const addToCart = (product, quantity = 1) => {
  const stockLimit = product.stock != null ? product.stock : Infinity

  setItems(prev => {
    const existing = prev.find(i => i.id === product.id)

    if (existing) {
      return prev.map(i =>
        i.id === product.id
          ? {
              ...i,
              quantity: Math.min(i.quantity + quantity, stockLimit)
            }
          : i
      )
    }

    return [
      ...prev,
      {
        ...product,
        quantity: Math.min(quantity, stockLimit)
      }
    ]
  })
}
  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) return removeFromCart(id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.min(quantity, i.stock != null ? i.stock : Infinity) } : i))
  }
  const removeFromCart = (id) => setItems(prev => prev.filter(i => i.id !== id))
  const clearCart = () => setItems([])
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  return <CartContext.Provider value={{ items, isCartOpen, setIsCartOpen, addToCart, updateQuantity, removeFromCart, clearCart, subtotal, itemCount }}>{children}</CartContext.Provider>
}
export const useCart = () => useContext(CartContext)