import { Ionicons } from '@expo/vector-icons'; // Usamos iconos estándar
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../FirebaseConfig';
import { useCart } from '../context/CartContext';

type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenURL: string;
  stock: number;
  productorId: string;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar la cantidad seleccionada (Empieza en 1)
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          Alert.alert('Error', 'Producto no encontrado');
          router.back();
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // --- LÓGICA DE CANTIDAD ---
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else {
      Alert.alert("Stock máximo", "No puedes agregar más unidades de las disponibles.");
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Enviamos la cantidad elegida al contexto
    addToCart(product, quantity);
    Alert.alert('¡Listo!', `Agregaste ${quantity} unidades al carrito 🛒`);
    router.back(); 
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  if (!product) return null;

  return (
    <>
      <Stack.Screen options={{ title: product.nombre }} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Image source={{ uri: product.imagenURL }} style={styles.image} />
        
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{product.nombre}</Text>
            <Text style={styles.price}>${product.precio}</Text>
          </View>
          
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Disponibles: {product.stock}</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{product.descripcion}</Text>

          {/* --- SELECTOR DE CANTIDAD --- */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Cantidad a comprar:</Text>
            
            <View style={styles.counterContainer}>
              {/* Botón Menos */}
              <Pressable onPress={decreaseQuantity} style={[styles.counterBtn, quantity === 1 && styles.disabledBtn]}>
                <Ionicons name="remove" size={24} color={quantity === 1 ? "#ccc" : "#333"} />
              </Pressable>
              
              {/* Número Cantidad */}
              <Text style={styles.counterValue}>{quantity}</Text>
              
              {/* Botón Más */}
              <Pressable onPress={increaseQuantity} style={[styles.counterBtn, quantity >= product.stock && styles.disabledBtn]}>
                <Ionicons name="add" size={24} color={quantity >= product.stock ? "#ccc" : "#333"} />
              </Pressable>
            </View>
          </View>
          
          {/* Muestra cuánto vas a pagar en total */}
          <Text style={styles.totalPrice}>Total: ${product.precio * quantity}</Text>

          {/* Botón Agregar */}
          <Pressable style={styles.addButton} onPress={handleAddToCart}>
            <Ionicons name="cart" size={24} color="white" />
            <Text style={styles.addButtonText}>Agregar al Carrito</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 300, resizeMode: 'cover', backgroundColor: '#f0f0f0' },
  
  infoContainer: { padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, marginTop: -20, backgroundColor: 'white', flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', flex: 1 },
  price: { fontSize: 26, fontWeight: 'bold', color: '#28a745' },
  
  stockBadge: { backgroundColor: '#e6fffa', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginBottom: 20 },
  stockText: { color: '#00c853', fontWeight: '600' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#444' },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 20 },
  
  // --- ESTILOS DEL CONTADOR ---
  quantitySection: { marginBottom: 15 },
  quantityLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10, color: '#555' },
  counterContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: '#eee',
    width: 160 
  },
  counterBtn: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 1
  },
  disabledBtn: {
    backgroundColor: '#f5f5f5',
    elevation: 0
  },
  counterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },

  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'right' },

  addButton: { backgroundColor: '#28a745', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  addButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});