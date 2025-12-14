import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext'; // <--- Importamos el carrito

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider> 
        {/* Envolvemos la app con CartProvider para que el carrito funcione en todas las pantallas */}
        
        <Stack>
          {/* Pantalla inicial */}
          <Stack.Screen
            name="welcome"
            options={{
              headerTitle: '🌱 AgroConexión',
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
            }}
          />
          {/* Login */}
          <Stack.Screen
            name="login-screen"
            options={{
              headerTitle: '🌱 AgroConexión',
              headerTitleAlign: 'center',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
            }}
          />
          {/* Registro */}
          <Stack.Screen
            name="signup-screen"
            options={{
              headerTitle: '🌱 AgroConexión',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
              headerTintColor: '#28a745',
            }}
          />
          
          {/* Rutas de Productor */}
          <Stack.Screen
            name="create-product"
            options={{
              headerTitle: 'Publicar Producto',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
              headerTintColor: '#28a745',
            }}
          />
          <Stack.Screen
            name="edit-product"
            options={{
              headerTitle: 'Editar Producto',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
              headerTintColor: '#28a745',
            }}
          />
          
          {/* --- RUTAS DE COMPRADOR --- */}
          <Stack.Screen
            name="product-detail"
            options={{
              headerTitle: 'Detalle',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
              headerTintColor: '#28a745',
              
            }}
          />
          <Stack.Screen
            name="cart"
            options={{
              headerTitle: 'Mi Carrito',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
              headerTintColor: '#28a745',
            }}
          />
          <Stack.Screen
            name="producer-orders"
            options={{
              headerTitle: 'Mis Pedidos 📦',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
              headerTintColor: '#28a745',
            }}
          />
          <Stack.Screen
            name="buyer-orders"
            options={{
              headerTitle: 'Mis Compras 🛍️',
              headerShadowVisible: false,
              headerStyle: { backgroundColor: 'white' },
              headerTintColor: '#28a745',
            }}
          />
          {/* Tabs principales */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>

      </CartProvider>
    </AuthProvider>
  );
}