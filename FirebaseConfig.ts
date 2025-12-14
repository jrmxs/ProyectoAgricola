import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; // Asegúrate de tener la librería instalada
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBolnqJr8OxlRgnC9_fV97-F0Ax4Y4rO18",
  authDomain: "agroconexion-46902.firebaseapp.com",
  projectId: "agroconexion-46902",
  storageBucket: "agroconexion-46902.firebasestorage.app",
  messagingSenderId: "117136164650",
  appId: "1:117136164650:web:11b434cda4d037801c8053",
  measurementId: "G-6XT468B2GX"
};

// Inicializamos la app con la configuración de Firebase
const app = initializeApp(firebaseConfig);

// --- CONFIGURAMOS AUTH CON PERSISTENCIA ---
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),  // Agregamos AsyncStorage para persistencia
});

// Exportamos los servicios de Firebase
export const db = getFirestore(app);
export const storage = getStorage(app);
export { auth };

