import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  compradorNombre: string;
  total: number;
  estado: 'pendiente' | 'en_proceso' | 'entregado' | 'cancelado'; // Agregamos 'en_proceso'
  fecha: any;
  productos: OrderItem[];
};

export default function ProducerOrdersScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('productorId', '==', user.uid),
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

  // --- FUNCIÓN PARA AVANZAR EL ESTADO ---
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        estado: newStatus
      });
      // Mensajes personalizados según el estado
      if (newStatus === 'en_proceso') {
        Alert.alert("¡Pedido Aceptado!", "El cliente verá que estás preparando su pedido. 📦");
      } else if (newStatus === 'entregado') {
        Alert.alert("¡Excelente!", "Pedido finalizado y entregado. ✅");
      }
      setSelectedOrder(null);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el pedido");
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '#ff8800'; // Naranja
      case 'en_proceso': return '#3399ff'; // Azul (Nuevo)
      case 'entregado': return '#28a745'; // Verde
      case 'cancelado': return '#ff4444';
      default: return '#999';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'PENDIENTE';
      case 'en_proceso': return 'PREPARANDO';
      case 'entregado': return 'ENTREGADO';
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
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="documents-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>No tienes pedidos pendientes.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => setSelectedOrder(item)}>
              <View style={styles.cardHeader}>
                <Text style={styles.buyerName}>{item.compradorNombre}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
                  <Text style={styles.statusText}>{getStatusText(item.estado)}</Text>
                </View>
              </View>
              
              <Text style={styles.dateText}>
                {item.fecha?.toDate ? item.fecha.toDate().toLocaleDateString() : 'Reciente'}
              </Text>
              
              <View style={styles.divider} />
              
              <View style={styles.cardFooter}>
                <Text style={styles.totalLabel}>Total: <Text style={styles.totalValue}>${item.total}</Text></Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            </Pressable>
          )}
        />
      )}

      {/* --- MODAL DE GESTIÓN --- */}
      <Modal visible={!!selectedOrder} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gestionar Pedido</Text>
              <Pressable onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              <Text style={styles.sectionLabel}>Cliente:</Text>
              <Text style={styles.modalText}>{selectedOrder?.compradorNombre}</Text>

              <Text style={styles.sectionLabel}>Productos:</Text>
              {selectedOrder?.productos.map((prod, index) => (
                <View key={index} style={styles.productRow}>
                  <Text style={styles.productText}>• {prod.nombre} (x{prod.cantidad})</Text>
                  <Text style={styles.productPrice}>${prod.subtotal}</Text>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.modalTotalLabel}>TOTAL:</Text>
                <Text style={styles.modalTotalValue}>${selectedOrder?.total}</Text>
              </View>
            </ScrollView>

            {/* --- BOTONES INTELIGENTES SEGÚN ESTADO --- */}
            <View style={styles.actionButtons}>
              
              {/* CASO 1: PENDIENTE -> ACEPTAR */}
              {selectedOrder?.estado === 'pendiente' && (
                <Pressable 
                  style={[styles.actionButton, { backgroundColor: '#3399ff' }]} 
                  onPress={() => handleUpdateStatus(selectedOrder.id, 'en_proceso')}
                >
                  <Text style={styles.buttonText}>📦 Aceptar y Preparar</Text>
                </Pressable>
              )}

              {/* CASO 2: EN PROCESO -> ENTREGAR */}
              {selectedOrder?.estado === 'en_proceso' && (
                <Pressable 
                  style={[styles.actionButton, { backgroundColor: '#28a745' }]} 
                  onPress={() => handleUpdateStatus(selectedOrder.id, 'entregado')}
                >
                  <Text style={styles.buttonText}>✅ Marcar como Entregado</Text>
                </Pressable>
              )}

              {/* CASO 3: FINALIZADO */}
              {selectedOrder?.estado === 'entregado' && (
                <View style={styles.completedInfo}>
                  <Ionicons name="checkmark-circle" size={24} color="#28a745" />
                  <Text style={styles.completedText}>Pedido Finalizado</Text>
                </View>
              )}

            </View>
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  buyerName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  dateText: { fontSize: 12, color: '#888', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: '#28a745' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  sectionLabel: { fontSize: 14, color: '#888', marginTop: 10, marginBottom: 5, fontWeight: 'bold' },
  modalText: { fontSize: 16, color: '#333', marginBottom: 5 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  productText: { fontSize: 16, color: '#444' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  modalTotalLabel: { fontSize: 18, fontWeight: 'bold' },
  modalTotalValue: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },
  actionButtons: { marginTop: 25 },
  actionButton: { padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  completedInfo: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#e6fffa', padding: 15, borderRadius: 10 },
  completedText: { color: '#28a745', fontWeight: 'bold', marginLeft: 10 }
});