import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView, // <--- Agregado
  StyleSheet,
  Text,
  View
} from 'react-native';
import { db } from '../../FirebaseConfig';
import { useCart } from '../../context/CartContext';

// Actualizamos el tipo para incluir la categoría y unidad
type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenURL: string;
  stock: number;
  categoria?: string; // <--- Importante para el filtro
  unidad?: string;    // <--- Para mostrar "por kg"
};

export default function BuyerHome({ nombre }: { nombre: string }) {
  const router = useRouter();
  const { count } = useCart(); 

  // --- ESTADOS ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para la categoría seleccionada (Empieza en 'Todos')
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Lista de categorías (Debe coincidir con las que usas al crear)
  const categories = ['Todos', 'Verduras', 'Frutas', 'Lácteos', 'Granos'];

  // --- CARGA DE DATOS ---
  useEffect(() => {
    // Traemos TODO lo que tenga stock > 0
    const q = query(collection(db, 'products'), where('stock', '>', 0));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- LÓGICA DE FILTRADO ---
  // Filtramos la lista original basándonos en la categoría seleccionada
  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'Todos') return true;
    return product.categoria === selectedCategory;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}> 
          <Text style={styles.welcomeTitle}>Hola, {nombre || 'Cliente'} 👋</Text>
        </View>
      </View>

      {/* Botón Mis Compras */}
      <Pressable 
        style={styles.myOrdersButton}
        onPress={() => router.push('/buyer-orders')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.ordersIconBg}>
            <Ionicons name="bag-handle" size={20} color="#28a745" />
          </View>
          <Text style={styles.myOrdersText}>Ver Mis Compras</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#28a745" />
      </Pressable>

      <Text style={styles.subtitle}>Categorías</Text>

      {/* --- SELECTOR DE CATEGORÍAS --- */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginTop: 10, marginBottom: 10 }}
      >
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.catButton,
              selectedCategory === cat && styles.catButtonActive
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[
              styles.catText,
              selectedCategory === cat && styles.catTextActive
            ]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.subtitle}>Productos disponibles ({filteredProducts.length}):</Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}> 

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredProducts} // <--- AQUI USAMOS LA LISTA FILTRADA
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ padding: 15, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Pressable 
              style={styles.card} 
              onPress={() => router.push(`/product-detail?id=${item.id}`)}
            >
              <Image source={{ uri: item.imagenURL }} style={styles.image} />
              
              <View style={styles.info}>
                <View>
                  {/* Etiqueta de Categoría pequeña */}
                  <Text style={styles.catLabel}>{item.categoria || 'Varios'}</Text>
                  <Text style={styles.name} numberOfLines={1}>{item.nombre}</Text>
                  <Text style={styles.description} numberOfLines={2}>{item.descripcion}</Text>
                </View>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.price}>${item.precio}</Text>
                    {/* Mostramos la unidad si existe */}
                    <Text style={styles.stockText}>
                      {item.stock} {item.unidad ? item.unidad : ''} disponibles
                    </Text>
                  </View>
                  <Ionicons name="add-circle" size={32} color="#28a745" />
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 30 }}>
              <Ionicons name="leaf-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                No hay productos en la categoría "{selectedCategory}".
              </Text>
            </View>
          }
        />
      )}

      {count > 0 && (
        <Pressable 
          style={styles.floatingCartBtn} 
          onPress={() => router.push('/cart')}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
          <Ionicons name="cart" size={28} color="white" />
        </Pressable>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  
  headerContainer: { marginBottom: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },

  welcomeTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 18, color: '#333', marginTop: 15, fontWeight: '700' },

  myOrdersButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2
  },
  ordersIconBg: { marginRight: 10 },
  myOrdersText: { color: '#333', fontWeight: '600', fontSize: 15 },

  // --- ESTILOS DE CATEGORÍAS ---
  catButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  catButtonActive: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  catText: {
    color: '#666',
    fontWeight: '600'
  },
  catTextActive: {
    color: '#fff',
    fontWeight: 'bold'
  },

  // --- ESTILOS TARJETA ---
  card: { backgroundColor: 'white', borderRadius: 16, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, height: 130 },
  image: { width: 120, height: '100%', resizeMode: 'cover' },
  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  
  catLabel: { fontSize: 10, color: '#28a745', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  description: { fontSize: 12, color: '#777', marginBottom: 5 },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  stockText: { fontSize: 11, color: '#999' },
  
  emptyText: { textAlign: 'center', color: '#888', marginTop: 10 },

  // --- CARRITO FLOTANTE ---
  floatingCartBtn: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#ff8800', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, zIndex: 999 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ff4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});