import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { db } from '../FirebaseConfig';

type OrderItem = {
  productId: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

type Order = {
  id: string;
  productorId: string;
  total: number;
  estado: 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado';
  fecha: any;
  productos: OrderItem[];
};

export default function BuyerOrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;

    // CONSULTA: Dame los pedidos donde YO soy el COMPRADOR
    const q = query(
      collection(db, 'orders'),
      where('compradorId', '==', user.uid),
      orderBy('fecha', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- COLORES Y TEXTOS SEGÚN ESTADO ---
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '#ff8800'; // Naranja
      case 'en_proceso': return '#3399ff'; // Azul
      case 'entregado': return '#28a745'; // Verde
      case 'cancelado': return '#ff4444'; // Rojo
      default: return '#999';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '🕒 Pendiente';
      case 'en_proceso': return '📦 En Preparación';
      case 'entregado': return '✅ Entregado';
      case 'cancelado': return '❌ Cancelado';
      default: return estado.toUpperCase();
    }
  };

  return (
    <View style={styles.container}>
      

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-handle-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>Aún no has realizado compras.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => setSelectedOrder(item)}>
              
              <View style={styles.cardHeader}>
                <Text style={styles.dateText}>
                  {item.fecha?.toDate ? item.fecha.toDate().toLocaleDateString() : 'Reciente'}
                </Text>
                
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
                  <Text style={styles.statusText}>
                    {item.estado === 'en_proceso' ? 'PREPARANDO' : item.estado.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.summaryText}>
                {item.productos.length} producto(s) • Total: ${item.total}
              </Text>
              
              <View style={styles.cardFooter}>
                <Text style={styles.detailsLink}>Ver Detalle</Text>
                <Ionicons name="chevron-forward" size={16} color="#28a745" />
              </View>
            </Pressable>
          )}
        />
      )}

      {/* --- MODAL DETALLE --- */}
      <Modal visible={!!selectedOrder} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Resumen de Compra</Text>
              <Pressable onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            {/* Banner de Estado Grande */}
            <View style={[styles.statusBanner, { backgroundColor: getStatusColor(selectedOrder?.estado || 'pendiente') }]}>
              <Text style={styles.statusBannerText}>
                {getStatusLabel(selectedOrder?.estado || '')}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 400, marginTop: 15 }}>
              <Text style={styles.sectionLabel}>Productos Comprados:</Text>
              {selectedOrder?.productos.map((prod, index) => (
                <View key={index} style={styles.productRow}>
                  <Text style={styles.productText}>
                    <Text style={{fontWeight: 'bold'}}>{prod.cantidad}x</Text> {prod.nombre}
                  </Text>
                  <Text style={styles.productPrice}>${prod.subtotal}</Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.modalTotalLabel}>TOTAL PAGADO:</Text>
                <Text style={styles.modalTotalValue}>${selectedOrder?.total}</Text>
              </View>
            </ScrollView>

            <Pressable 
              style={styles.closeButton} 
              onPress={() => setSelectedOrder(null)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: 'white', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', marginLeft: 15, color: '#333' },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, color: '#888', fontSize: 16 },

  card: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  summaryText: { fontSize: 14, color: '#666', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  detailsLink: { color: '#28a745', fontSize: 14, fontWeight: '600', marginRight: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  
  statusBanner: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  statusBannerText: { color: 'white', fontWeight: 'bold', fontSize: 18 },

  sectionLabel: { fontSize: 14, color: '#888', marginBottom: 10, fontWeight: 'bold' },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  productText: { fontSize: 16, color: '#444' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingTop: 15, borderTopWidth: 2, borderColor: '#eee' },
  modalTotalLabel: { fontSize: 18, fontWeight: '900', color: '#333' },
  modalTotalValue: { fontSize: 22, fontWeight: 'bold', color: '#28a745' },
  
  closeButton: { marginTop: 25, backgroundColor: '#eee', padding: 15, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});