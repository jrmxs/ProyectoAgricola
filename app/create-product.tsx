import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import uuid from 'react-native-uuid';

// Asegúrate de que la ruta a FirebaseConfig sea correcta
import { auth, db, storage } from '../FirebaseConfig';

export default function CreateProductScreen() {
  const router = useRouter();
  
  // Estados del formulario
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [stock, setStock] = useState(''); 
  const [uploading, setUploading] = useState(false);

  // --- NUEVOS ESTADOS: Categoría y Unidad ---
  const [category, setCategory] = useState('Verduras'); // Valor por defecto
  const [unit, setUnit] = useState('kg'); // Valor por defecto

  // Listas de opciones
  const categoriesList = ['Verduras', 'Frutas', 'Lácteos', 'Granos'];
  const unitsList = ['kg', 'unidad', 'litro', 'saco'];

  // 1. ELEGIR FOTO
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri); 

      try {
        setUploading(true);
        const response = await fetch(uri);
        const blob = await response.blob();
        
        const imageName = uuid.v4(); 
        const storageRef = ref(storage, `products/images/${imageName}`);

        const uploadTask = uploadBytesResumable(storageRef, blob);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Subiendo: ${progress.toFixed(0)}%`);
          },
          (error) => {
            console.error("Error subiendo imagen:", error);
            Alert.alert('Error', 'Hubo un problema al subir la imagen.');
            setUploading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Imagen disponible en:', downloadURL);
            setImage(downloadURL); 
            setUploading(false);
          }
        );
      } catch (error) {
        console.error("Error en proceso de imagen:", error);
        setUploading(false);
      }
    }
  };

  // 2. PUBLICAR PRODUCTO
  const handlePublish = async () => {
    if (!name || !price || !description || !image || !stock) {
      Alert.alert('Faltan datos', 'Por favor completa todos los campos y sube una foto.');
      return;
    }

    const priceNumber = parseFloat(price);
    const stockNumber = parseInt(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber)) {
      Alert.alert('Error', 'El precio y el stock deben ser números válidos.');
      return;
    }

    if (image.startsWith('file://')) {
      Alert.alert('Espera', 'La imagen se está subiendo. Inténtalo en unos segundos.');
      return;
    }

    setUploading(true);

    try {
      await addDoc(collection(db, "products"), {
        nombre: name,
        precio: priceNumber,
        descripcion: description,
        imagenURL: image,
        productorId: auth.currentUser?.uid,
        fecha: new Date(),
        stock: stockNumber,
        // --- GUARDAMOS CATEGORÍA Y UNIDAD ---
        categoria: category,
        unidad: unit,
        busqueda: name.toLowerCase() 
      });

      Alert.alert('¡Éxito! 🎉', 'Tu producto ha sido publicado correctamente.', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert('Error', 'No se pudo guardar el producto. Revisa tu conexión.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Nuevo Producto</Text>
      <Text style={styles.subtitle}>Completa los datos para vender</Text>

      {/* Selector de Imagen */}
      <Pressable onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera" size={40} color="#999" />
            <Text style={styles.imageText}>Toca para subir foto</Text>
          </View>
        )}
        {uploading && !name && ( 
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator color="#28a745" />
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Nombre del producto</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Ej: Tomates Frescos" 
        value={name} 
        onChangeText={setName} 
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

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Precio ($)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="1500" 
            keyboardType="numeric" 
            value={price} 
            onChangeText={setPrice} 
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Stock ({unit})</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 50"
            keyboardType="numeric"
            value={stock}
            onChangeText={setStock}
          />
        </View>
      </View>

      <Text style={styles.label}>Descripción</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        placeholder="Describe tu producto (origen, calidad, etc.)" 
        multiline 
        numberOfLines={4} 
        value={description} 
        onChangeText={setDescription} 
      />

      <Pressable 
        style={[styles.button, uploading && styles.buttonDisabled]} 
        onPress={handlePublish} 
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Publicar Producto</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  
  imagePicker: { 
    width: '100%', 
    height: 200, 
    backgroundColor: '#f8f9fa', 
    borderRadius: 15, 
    marginBottom: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#e9ecef', 
    borderStyle: 'dashed', 
    overflow: 'hidden' 
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderContainer: { alignItems: 'center' },
  imageText: { color: '#999', marginTop: 10, fontWeight: '600' },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center' },

  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#444' },
  input: { 
    backgroundColor: '#f8f9fa', 
    borderWidth: 1, 
    borderColor: '#e9ecef', 
    borderRadius: 10, 
    padding: 15, 
    fontSize: 16, 
    marginBottom: 10,
    color: '#333'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between' },

  button: { 
    backgroundColor: '#28a745', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10, 
    elevation: 3,
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4
  },
  buttonDisabled: { backgroundColor: '#a5d6a7' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  // --- ESTILOS NUEVOS PARA LOS CHIPS (BOTONES) ---
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