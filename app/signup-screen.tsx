import { useLocalSearchParams, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet, // <-- Corregido
  Text,
  TextInput,
  View, // <-- Corregido
} from 'react-native';
import { auth, db } from '../FirebaseConfig'; // Asegúrate de que la 'F' esté mayúscula

export default function RegisterScreen() {
  const { tipo } = useLocalSearchParams(); 
  const [userType, setUserType] = useState(tipo === 'productor' ? 'productor' : 'comprador');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter(); 

  const handleCreateAccount = async () => {
    if (!nombre || !email || !telefono || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    setIsLoading(true); 
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log('Usuario creado en Auth:', user.uid);
      await setDoc(doc(db, 'users', user.uid), {
        nombre: nombre,
        telefono: telefono,
        tipo: userType,
        email: email, 
      });
      console.log('Datos del usuario guardados en Firestore');
      await signOut(auth);
      Alert.alert(
        '¡Cuenta Creada!',
        'Tu cuenta ha sido registrada con éxito.'
      );
      router.push('/login-screen'); 
    } catch (error: any) {
      console.error('Error al crear cuenta:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Este correo electrónico ya está en uso.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      } else {
        Alert.alert('Error', 'No se pudo crear la cuenta.');
      }
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <View style={styles.safeArea}> 
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Únete a la comunidad agrícola</Text>

        <Text style={styles.label}>Tipo de usuario</Text>
        <View style={styles.userTypeContainer}>
          <Pressable
            style={[
              styles.userTypeButton,
              userType === 'comprador' && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType('comprador')}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === 'comprador' && styles.userTypeTextActive,
              ]}
            >
              🛒 Comprador
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.userTypeButton,
              userType === 'productor' && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType('productor')}
          >
            <Text
              style={[
                styles.userTypeText,
                userType === 'productor' && styles.userTypeTextActive,
              ]}
            >
              🌱 Productor
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>Nombre completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Juan Pérez"
          value={nombre}
          onChangeText={setNombre}
          autoCapitalize="words"
        />
        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="+56 9 1234 5678"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
        />
        <Text style={styles.label}>Confirmar contraseña</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry 
        />
        <Pressable 
          style={styles.button} 
          onPress={handleCreateAccount} 
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" /> 
          ) : (
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          )}
        </Pressable>
        <Pressable onPress={() => router.back()} disabled={isLoading} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? Inicia sesión</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    height: 80,
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  userTypeButtonActive: {
    borderColor: '#28a745',
    backgroundColor: '#f0fff4',
  },
  userTypeText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  userTypeTextActive: {
    color: '#28a745',
  },
  button: {
    backgroundColor: '#28a745',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    marginBottom: 40,
  },
  loginLinkText: {
    color: '#28a745',
    textAlign: 'center',
    fontWeight: '600',
  }
});