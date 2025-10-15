import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth, db } from '../configs/firebase_config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { supabase, STORAGE_BUCKET } from '../configs/supabase_config';

const CadastrarAnimal = ({ navigation }) => {
  const [animalName, setAnimalName] = useState('');
  const [selectedAnimalType, setSelectedAnimalType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Função para selecionar imagem
  const pickImage = async () => {
    try {
      // Solicitar permissão
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }

      // Abrir galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  // Função para fazer upload da imagem no Supabase
  const uploadImage = async (imageUri) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar nome único para o arquivo
      const fileExt = imageUri.split('.').pop();
      const fileName = `${user.uid}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Para web
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            upsert: false
          });

        if (error) throw error;
      } else {
        // Para mobile
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            upsert: false
          });

        if (error) throw error;
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  };

  const handleCadastrar = async () => {
    // Validações
    if (!animalName.trim()) {
      Alert.alert('Aviso', 'Por favor, digite o nome do animal.');
      return;
    }

    if (!selectedAnimalType) {
      Alert.alert('Aviso', 'Por favor, selecione o tipo do animal.');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Aviso', 'Por favor, selecione uma foto do animal.');
      return;
    }

    setUploading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      // 1. Fazer upload da imagem no Supabase
      const imageUrl = await uploadImage(selectedImage);

      // 2. Salvar dados no Firestore
      const animaisRef = collection(db, 'animais');
      await addDoc(animaisRef, {
        nome: animalName,
        tipo: selectedAnimalType,
        fotoUrl: imageUrl,
        doadorId: user.uid,
        doadorEmail: user.email,
        status: 'Disponível',
        candidatos: [],
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });

      Alert.alert('Sucesso', 'Animal cadastrado com sucesso!');
      
      // Limpa os campos
      setAnimalName('');
      setSelectedAnimalType('');
      setSelectedImage(null);
      
      // Redireciona para Meus Animais
      navigation.navigate('MeusAnimais');
    } catch (error) {
      console.error('Erro ao cadastrar animal:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o animal. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTitle}>Cadastrar Animal</Text>

        {/* Área de foto */}
        <TouchableOpacity 
          style={styles.photoArea}
          onPress={pickImage}
          disabled={uploading}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={40} color="#999" />
              <Text style={styles.photoText}>Adicionar Foto</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Input Nome */}
        <Text style={styles.inputLabel}>Nome do Animal</Text>
        <TextInput
          style={styles.input}
          value={animalName}
          onChangeText={setAnimalName}
          placeholder="Digite o nome"
          placeholderTextColor="#999"
        />

        {/* Seleção de tipo de animal */}
        <Text style={styles.inputLabel}>Tipo de Animal</Text>
        <View style={styles.animalTypeContainer}>
          <TouchableOpacity
            style={[
              styles.animalTypeButton,
              selectedAnimalType === 'Cão' && styles.animalTypeButtonSelected
            ]}
            onPress={() => setSelectedAnimalType('Cão')}
          >
            <Ionicons 
              name="paw" 
              size={24} 
              color={selectedAnimalType === 'Cão' ? '#fff' : '#4e2096'} 
            />
            <Text style={[
              styles.animalTypeText,
              selectedAnimalType === 'Cão' && styles.animalTypeTextSelected
            ]}>Cão</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.animalTypeButton,
              selectedAnimalType === 'Gato' && styles.animalTypeButtonSelected
            ]}
            onPress={() => setSelectedAnimalType('Gato')}
          >
            <MaterialCommunityIcons 
              name="cat" 
              size={24} 
              color={selectedAnimalType === 'Gato' ? '#fff' : '#4e2096'} 
            />
            <Text style={[
              styles.animalTypeText,
              selectedAnimalType === 'Gato' && styles.animalTypeTextSelected
            ]}>Gato</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.animalTypeButton,
              selectedAnimalType === 'Cavalo' && styles.animalTypeButtonSelected
            ]}
            onPress={() => setSelectedAnimalType('Cavalo')}
          >
            <MaterialCommunityIcons 
              name="horse" 
              size={24} 
              color={selectedAnimalType === 'Cavalo' ? '#fff' : '#4e2096'} 
            />
            <Text style={[
              styles.animalTypeText,
              selectedAnimalType === 'Cavalo' && styles.animalTypeTextSelected
            ]}>Cavalo</Text>
          </TouchableOpacity>
        </View>

        {/* Botões de ação */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.btn, styles.cancelBtn]}
            onPress={() => {
              setAnimalName('');
              setSelectedAnimalType('');
              navigation.goBack();
            }}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.saveBtn, uploading && styles.btnDisabled]}
            onPress={handleCadastrar}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveText}>Cadastrar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e2096',
    textAlign: 'center',
    marginBottom: 20,
  },
  photoArea: {
    height: 150,
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  photoText: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4e2096',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  animalTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10,
  },
  animalTypeButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  animalTypeButtonSelected: {
    backgroundColor: '#4e2096',
    borderColor: '#4e2096',
  },
  animalTypeText: {
    color: '#4e2096',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  animalTypeTextSelected: {
    color: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#E0E0E0',
  },
  saveBtn: {
    backgroundColor: '#4e2096',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default CadastrarAnimal;
