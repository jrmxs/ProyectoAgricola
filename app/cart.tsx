import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { db } from '../FirebaseConfig';

export default function CartScreen() {
  const router = useRouter();
  const { items, removeFromCart, clearCart, total } = useCart();
  const { userData, user } = useAuth(); // Datos del comprador
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    // 1. Verificar si el usuario está logueado
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión para comprar.");
      return;
    }

    setIsProcessing(true);

    try {
      // 2. AGRUPAR PRODUCTOS POR PRODUCTOR
      // Esto es clave: Si compras a Juan y a María, se crean 2 pedidos separados.
      const ordersByProducer: Record<string, any[]> = {};

      items.forEach((item) => {
        // Asegúrate de que tus productos tengan 'productorId' (lo agregamos al CartContext antes)
        const pId = item.productorId || 'admin'; // Fallback por si acaso
        
        if (!ordersByProducer[pId]) {
          ordersByProducer[pId] = [];
        }
        
        ordersByProducer[pId].push({
          productId: item.id,
          nombre: item.nombre,
          cantidad: item.quantity,
          precioUnitario: item.precio,
          subtotal: item.precio * item.quantity,
          imagenURL: item.imagenURL
        });
      });

      // 3. CREAR UN PEDIDO POR CADA PRODUCTOR EN FIREBASE
      const promises = Object.keys(ordersByProducer).map(async (producerId) => {
        const productsForThisProducer = ordersByProducer[producerId];
        const totalForThisProducer = productsForThisProducer.reduce((sum, item) => sum + item.subtotal, 0);

        // Guardamos en la colección "orders"
        await addDoc(collection(db, 'orders'), {
          productorId: producerId, // ID del productor (Dueño de los productos)
          compradorId: user.uid,   // ID del comprador (Tú)
          compradorNombre: userData?.nombre || 'Usuario Anónimo',
          productos: productsForThisProducer, // Lista de lo que le compraste a ÉL
          total: totalForThisProducer,
          estado: 'pendiente', // Estados posibles: pendiente, aceptado, rechazado
          fecha: serverTimestamp(),
        });
      });

      // Esperamos a que todos los pedidos se guarden
      await Promise.all(promises);

      // 4. ÉXITO
      Alert.alert(
        '¡Compra Exitosa! 🎉',
        'Tu pedido ha sido enviado a los productores correctamente.',
        [
          {
            text: 'Genial',
            onPress: () => {
              clearCart(); 
              router.back(); 
            },
          },
        ]
      );

    } catch (error) {
      console.error("Error al comprar:", error);
      Alert.alert("Error", "Hubo un problema al procesar tu compra. Inténtalo de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={{ marginTop: 10, color: '#666' }}>Enviando pedido a los productores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ddd" />
          <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          <Pressable style={styles.shopButton} onPress={() => router.back()}>
            <Text style={styles.shopButtonText}>Ir a Comprar</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.imagenURL }} style={styles.image} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.nombre}</Text>
                  <Text style={styles.itemPrice}>${item.precio} x {item.quantity}</Text>
                  <Text style={styles.subtotal}>Subtotal: ${item.precio * item.quantity}</Text>
                </View>
                <Pressable onPress={() => removeFromCart(item.id)} style={styles.removeButton}>
                  <Ionicons name="trash-outline" size={24} color="#ff4444" />
                </Pressable>
              </View>
            )}
          />
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a Pagar:</Text>
              <Text style={styles.totalAmount}>${total}</Text>
            </View>
            <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Confirmar Compra</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#888', marginTop: 20, marginBottom: 20 },
  shopButton: { backgroundColor: '#28a745', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  shopButtonText: { color: 'white', fontWeight: 'bold' },

  cartItem: { backgroundColor: 'white', flexDirection: 'row', borderRadius: 12, padding: 10, marginBottom: 12, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#eee' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemPrice: { fontSize: 14, color: '#666' },
  subtotal: { fontSize: 14, color: '#28a745', fontWeight: 'bold', marginTop: 2 },
  
  removeButton: { padding: 10 },

  footer: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -2 } },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  totalLabel: { fontSize: 18, color: '#333' },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: '#28a745' },
  
  checkoutButton: { backgroundColor: '#28a745', padding: 18, borderRadius: 15, alignItems: 'center' },
  checkoutText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});