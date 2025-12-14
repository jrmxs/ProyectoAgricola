import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native'; // <--- Quitamos ScrollView
import { useAuth } from '../../context/AuthContext';

// Importamos los componentes separados
// Asegúrate de que las rutas coincidan con tus carpetas reales (mayúsculas/minúsculas)
import BuyerHome from '../../components/home/buyerHome';
import ProducerHome from '../../components/home/Producerhome';

export default function HomeScreen() {
  const { userData, logout } = useAuth();

  return (
    <View style={styles.container}>
      {/* --- HEADER COMÚN (BARRA VERDE) --- */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Aquí podrías poner el logo pequeño si quieres */}
            <Text style={styles.headerTitle}>AgroConexión</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutButton}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>Salir</Text>
        </Pressable>
      </View>

      {/* 🚨 CORRECCIÓN IMPORTANTE:
         Cambiamos ScrollView por View.
         Esto permite que BuyerHome maneje su propio scroll sin errores.
      */}
      <View style={styles.content}>
        
        {/* --- EL JUEZ DE TRÁFICO --- */}
        {userData?.tipo === 'productor' ? (
          <ProducerHome nombre={userData.nombre} />
        ) : (
          <BuyerHome nombre={userData?.nombre || 'Usuario'} />
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', 
  },
  header: {
    padding: 20,
    paddingTop: 60, // Espacio para la barra de estado
    backgroundColor: '#28a745', // Verde
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 4, // Sombra suave en Android
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 20,
  },
  content: {
    flex: 1, // <--- VITAL: Ocupa todo el espacio restante para que la lista quepa
    // He quitado el padding: 20 general porque cortaba el scroll de la lista.
    // BuyerHome ya tiene su propio padding interno.
  },
});