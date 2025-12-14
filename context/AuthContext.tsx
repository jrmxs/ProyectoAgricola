import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // <-- IMPORTANTE: Para leer la base de datos
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../FirebaseConfig'; // <-- IMPORTANTE: Importamos también 'db'

// 1. Definimos qué forma tienen los datos extra del usuario
type UserData = {
  nombre: string;
  tipo: 'productor' | 'comprador';
  email: string;
  telefono?: string;
};

// 2. Actualizamos el contexto para incluir 'userData'
const AuthContext = createContext<{
  user: User | null;
  userData: UserData | null; // <-- AQUÍ GUARDAMOS EL TIPO (Productor/Comprador)
  isLoading: boolean;
  logout: () => void;
}>({
  user: null,
  userData: null,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null); // Estado para los datos extra
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // --- SI HAY USUARIO, BUSCAMOS SUS DATOS EN FIRESTORE ---
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // ¡Encontramos los datos! (incluyendo si es productor o comprador)
            setUserData(docSnap.data() as UserData);
          } else {
            console.log("No se encontró el documento del usuario en Firestore");
          }
        } catch (error) {
          console.error("Error al traer datos del usuario:", error);
        }
      } else {
        // Si no hay usuario, limpiamos los datos
        setUserData(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null); // Limpiamos los datos al salir
      router.replace('/login-screen');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    // Compartimos 'userData' con toda la app
    <AuthContext.Provider value={{ user, userData, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};