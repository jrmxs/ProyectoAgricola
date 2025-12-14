import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../FirebaseConfig';

// Agregamos los tipos nuevos para que TypeScript no se queje
type Product = {
  nombre: string;
  precio: number;
  descripcion: string;
  stock: number;
  imagenURL: string;
  categoria?: string; // Opcional por si es un producto viejo sin categoría
  unidad?: string;    // Opcional
};

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  // Estados del formulario
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  
  // --- NUEVOS ESTADOS ---
  const [category, setCategory] = useState('Verduras');
  const [unit, setUnit] = useState('kg');
  
  const [loading, setLoading] = useState<boolean>(true);

  // Listas idénticas a create-product
  const categoriesList = ['Verduras', 'Frutas', 'Lácteos', 'Granos'];
  const unitsList = ['kg', 'unidad', 'litro', 'saco'];

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data() as Product;
          
          setName(productData.nombre);
          setPrice(productData.precio.toString());
          setDescription(productData.descripcion);
          setStock(productData.stock.toString());
          
          // Cargamos la categoría y unidad si existen, sino dejamos los default
          if (productData.categoria) setCategory(productData.categoria);
          if (productData.unidad) setUnit(productData.unidad);

        } else {
          Alert.alert('Error', 'Producto no encontrado.');
          router.back();
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Hubo un problema al cargar el producto.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!name || !price || !description || !stock) {
      Alert.alert('Faltan datos', 'Por favor completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      const productRef = doc(db, 'products', id as string);
      
      await updateDoc(productRef, {
        nombre: name,
        precio: parseFloat(price),
        descripcion: description,
        stock: parseInt(stock),
        // --- GUARDAMOS LOS NUEVOS CAMPOS ---
        categoria: category,
        unidad: unit,
        // IMPORTANTE: Actualizamos la búsqueda por si cambiaste el nombre
        busqueda: name.toLowerCase() 
      });

      Alert.alert('¡Éxito!', 'Producto actualizado correctamente.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      
    } catch (error) {
      console.error(error); // Es bueno ver el error en consola
      Alert.alert('Error', 'No se pudo actualizar el producto.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      

      <Text style={styles.label}>Nombre</Text>
      <TextInput 
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nombre del producto"
      />

      {/* --- SECCIÓN CATEGORÍAS --- */}
      <Text style={styles.label}>Categoría</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
        {categoriesList.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.chip,
              category === cat && styles.chipSelected
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[
              styles.chipText, 
              category === cat && styles.chipTextSelected
            ]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* --- SECCIÓN UNIDAD --- */}
      <Text style={styles.label}>Se vende por:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
        {unitsList.map((u) => (
          <Pressable
            key={u}
            style={[
              styles.chip,
              unit === u && styles.chipSelected
            ]}
            onPress={() => setUnit(u)}
          >
            <Text style={[
              styles.chipText, 
              unit === u && styles.chipTextSelected
            ]}>
              {u}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Precio ($)</Text>
          <TextInput 
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            placeholder="Precio"
            keyboardType="numeric"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Stock ({unit})</Text>
          <TextInput 
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            placeholder="Stock"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Descripción</Text>
      <TextInput 
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción"
        multiline
      />

      <Pressable style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, marginTop: 10 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#555' },
  input: { 
    backgroundColor: '#f9f9f9', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 15, 
    fontSize: 16, 
    marginBottom: 15 
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { 
    backgroundColor: '#28a745', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginTop: 10 
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // --- ESTILOS DE LOS CHIPS (IGUAL QUE EN CREATE) ---
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#28a745', 
    borderColor: '#28a745',
  },
  chipText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  chipTextSelected: {
    color: '#fff', 
    fontWeight: 'bold',
  },
});