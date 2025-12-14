import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, isLoading } = useAuth();  // Obtenemos el estado de autenticación
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;  // Si aún estamos verificando el estado de carga, no hacer nada

    if (user) {
      // Si el usuario está autenticado, redirigir al Home (pantalla principal)
      router.replace('/(tabs)/home');  // Redirige al home dentro de tabs
    } else {
      // Si no hay usuario, redirigir al login
      router.replace('/welcome');  // Redirige a la pantalla de login
    }
  }, [user, isLoading, router]);

  // Si estamos verificando la autenticación, mostramos un ActivityIndicator (loading spinner)
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#28a745" />
    </View>
  );
}
