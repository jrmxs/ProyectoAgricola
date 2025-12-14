import React, { createContext, ReactNode, useContext, useState } from 'react';

export type CartItem = {
  id: string;
  nombre: string;
  precio: number;
  imagenURL: string;
  quantity: number;
  stock?: number;
};

type CartContextType = {
  items: CartItem[];
  // ACTUALIZADO: Ahora acepta un segundo parámetro 'amount' (cantidad)
  addToCart: (product: any, amount?: number) => void; 
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // ACTUALIZADO: Recibimos 'amount'. Si no se envía, por defecto es 1.
  const addToCart = (product: any, amount: number = 1) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        // Si el producto ya estaba, le sumamos la nueva cantidad
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + amount } : item
        );
      }
      
      // Si es nuevo, lo agregamos con la cantidad elegida
      return [...currentItems, { ...product, quantity: amount }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Cálculos automáticos
  const total = items.reduce((sum, item) => sum + item.precio * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};