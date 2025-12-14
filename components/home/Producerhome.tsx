import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../FirebaseConfig';

type Product = {
  id: string;
  nombre: string;
  precio: number;
  imagenURL: string;
  stock: number;
  categoria?: string;
  unidad?: string;
};

export default function ProducerHome({ nombre }: { nombre: string }) {
  const router = useRouter();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // 1. CARGAR PRODUCTOS
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'products'), 
      where('productorId', '==', auth.currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setMyProducts(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. ESCUCHAR PEDIDOS PENDIENTES
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'orders'),
      where('productorId', '==', auth.currentUser.uid),
      where('estado', '==', 'pendiente')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingOrdersCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  // --- FUNCIÓN ELIMINAR ---
  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar Producto",
      "¿Estás seguro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "products", id));
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar.");
            }
          }
        }
      ]
    );
  };

  // --- CABECERA (Se renderiza dentro de la FlatList) ---
  const renderHeader = () => (
    <View>
      <Text style={styles.welcomeTitle}>Hola Agricultor, {nombre || 'Jorge'} 👋</Text>
      
      {/* Botón Publicar */}
      <Pressable 
        style={styles.actionButton}
        onPress={() => router.push('/create-product')} 
      >
        <View style={styles.iconContainer}>
          <Ionicons name="add" size={30} color="white" />
        </View>
        <View>
          <Text style={styles.actionTitle}>Publicar Nuevo Producto</Text>
          <Text style={styles.actionSubtitle}>Sube fotos y precios</Text>
        </View>
      </Pressable>

      {/* Botón Pedidos */}
      <Pressable 
        style={styles.ordersButton}
        onPress={() => router.push('/producer-orders')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.ordersIconBg}>
            <Ionicons name="receipt" size={24} color="#28a745" />
            {pendingOrdersCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {pendingOrdersCount > 9 ? '9+' : pendingOrdersCount}
                </Text>
              </View>
            )}
          </View>
          <View>
            <Text style={styles.ordersTitle}>Pedidos Recibidos</Text>
            <Text style={styles.ordersSubtitle}>
              {pendingOrdersCount > 0 
                ? `¡Tienes ${pendingOrdersCount} por despachar!` 
                : "Revisa y despacha tus ventas"}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </Pressable>

      <Text style={styles.sectionTitle}>Mis Productos ({myProducts.length})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={myProducts}
          keyExtractor={(item) => item.id}
          // Usamos ListHeaderComponent para que los botones de arriba scroleen junto con la lista
          ListHeaderComponent={renderHeader}
          // Padding inferior para que el último elemento no quede tapado
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 5 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.imagenURL }} style={styles.productImage} />
              
              <View style={styles.productInfo}>
                <Text style={styles.categoryLabel}>{item.categoria || 'GENERAL'}</Text>
                <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
                
                <View style={styles.detailsRow}>
                  <Text style={styles.productPrice}>
                    ${item.precio} <Text style={styles.unitSmall}>/ {item.unidad || 'u'}</Text>
                  </Text>
                </View>

                <Text style={[styles.productStock, item.stock < 10 && { color: '#e67e22' }]}>
                  Stock: {item.stock} {item.unidad}
                </Text>
              </View>

              <View style={styles.actionsContainer}>
                <Pressable 
                  onPress={() => router.push(`/edit-product?id=${item.id}`)}
                  style={styles.editButton}
                >
                  <Ionicons name="pencil" size={18} color="#fff" />
                </Pressable>

                <Pressable 
                  onPress={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No has publicado nada aún.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 15 },
  
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 10 },
  
  actionButton: { backgroundColor: 'white', padding: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, marginBottom: 15 },
  iconContainer: { width: 45, height: 45, backgroundColor: '#28a745', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  actionSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },

  ordersButton: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  ordersIconBg: { backgroundColor: '#e6f4ea', padding: 8, borderRadius: 20, marginRight: 15, position: 'relative' },
  ordersTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  ordersSubtitle: { fontSize: 12, color: '#666' },

  notificationBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ff4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white', zIndex: 10 },
  notificationText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

  productCard: { backgroundColor: 'white', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  productImage: { width: 80, height: 80, borderRadius: 12, marginRight: 15, backgroundColor: '#eee' },
  
  productInfo: { flex: 1, justifyContent: 'center' },
  categoryLabel: { fontSize: 10, color: '#28a745', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
  productName: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 2 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  productPrice: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  unitSmall: { fontSize: 12, color: '#888', fontWeight: 'normal' },
  productStock: { fontSize: 13, color: '#666' },

  actionsContainer: { alignItems: 'center', gap: 10 },
  editButton: { backgroundColor: '#ff8800', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  deleteButton: { backgroundColor: '#fff5f5', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  emptyCard: { padding: 30, alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  emptyText: { color: '#999', fontSize: 14, fontStyle: 'italic' },
});