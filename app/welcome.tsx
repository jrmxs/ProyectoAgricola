import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator, Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text, View
} from 'react-native';
import { useAuth } from '../context/AuthContext'; // Asegurarnos de obtener la autenticación

// <-- 2. IMPORTAMOS EL LOGO
const plantLogo = require('../assets/images/plant_logo.png'); 

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();  // Usamos el hook de autenticación

  // Si el usuario ya está logueado, redirigimos automáticamente a home
  useEffect(() => {
    if (isLoading) return;  // Si aún estamos verificando la autenticación, no hacer nada

    if (user) {
      router.replace('/(tabs)/home');  // Si hay un usuario, redirigir a Home
    }
  }, [user, isLoading, router]);

  // Si estamos cargando la sesión, mostramos un ActivityIndicator
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}> 
      <View style={styles.welcomeContent}>
        
        {/* <-- 3. AÑADIMOS EL LOGO AQUÍ ARRIBA --> */}
        <Image source={plantLogo} style={styles.mainLogo} />
        
        <Text style={styles.title}>
          Conecta directamente con productores agrícolas
        </Text>
        <Text style={styles.subtitle}>
          Productos frescos del campo a tu negocio. Sin intermediarios,
          mejores precios.
        </Text>

        {/* --- Botones --- */}
        <Pressable style={[styles.button, styles.buttonPrimary]}
            onPress={() => router.push('./login-screen')} >
          <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
            Iniciar Sesión
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.push('./signup-screen')} 
        >
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
            Crear Cuenta
          </Text>
        </Pressable>
      </View>

      {/* --- Sección de Tarjetas --- */}
      <View style={styles.cardsContainer}>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📦</Text>
            <Text style={styles.cardTitle}>Catálogo Amplio</Text>
            <Text style={styles.cardSubtitle}>
              Miles de productos frescos disponibles
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📈</Text>
            <Text style={styles.cardTitle}>Mejores Precios</Text>
            <Text style={styles.cardSubtitle}>
              Compra directo al productor
            </Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>🤝</Text>
            <Text style={styles.cardTitle}>Confiable</Text>
            <Text style={styles.cardSubtitle}>Productores verificados</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>🥬</Text>
            <Text style={styles.cardTitle}>Productos Frescos</Text>
            <Text style={styles.cardSubtitle}>Directo del campo</Text>
          </View>
        </View>
      </View>

      {/* --- NUEVA CAJA VERDE (CTA PRODUCTOR) --- */}
      <View style={styles.ctaContainer}>
        <Text style={styles.ctaTitle}>¿Eres productor agrícola?</Text>
        <Text style={styles.ctaSubtitle}>
          Únete a nuestra plataforma y vende tus productos directamente a compradores
        </Text>
        <Pressable 
          style={styles.ctaButton}
          onPress={() => router.push('/signup-screen?tipo=productor')} 
        >
          <Text style={styles.ctaButtonText}>Registrarme como Productor</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: 'white', 
  },
  welcomeContent: {
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center', 
    paddingTop: 40, // Espacio arriba
  },
  
  mainLogo: { 
    width: 140, // Tamaño grande
    height: 140,
    resizeMode: 'contain',
    marginBottom: 30, 
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%', 
  },
  buttonPrimary: {
    backgroundColor: '#28a745', 
  },
  buttonTextPrimary: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonTextSecondary: {
    color: '#555',
    fontSize: 18,
    fontWeight: '600',
  },
  cardsContainer: {
    backgroundColor: 'white', // Fondo blanco
    padding: 20,
    paddingTop: 30, 
    justifyContent: 'space-around', 
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15, 
  },
  card: {
    width: '48%', 
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, 
    justifyContent: 'flex-start', 
    minHeight: 120, 
  },
  cardIcon: {
    fontSize: 30, 
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 11,
    textAlign: 'center',
    color: '#666',
  },
  ctaContainer: {
    backgroundColor: '#28a745', 
    padding: 30,
    margin: 20,
    borderRadius: 15,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: 'white', 
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#28a745', 
    fontSize: 16,
    fontWeight: 'bold',
  },
});
