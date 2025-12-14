import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ocultamos el header superior por defecto
        
        // ESTA LÍNEA ES LA QUE OCULTA LA BARRA DE ABAJO
        tabBarStyle: { display: 'none' }, 
      }}>
      
      {/* Esta es tu pantalla principal */}
      <Tabs.Screen
        name="home" // Debe coincidir con el nombre de tu archivo: app/(tabs)/home.tsx
        options={{
          title: 'Inicio',
          // Aunque esté oculto, definimos el icono por si acaso
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}