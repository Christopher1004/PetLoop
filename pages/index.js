import { useState, useEffect } from 'react';
import {StyleSheet,Text,View,TouchableOpacity,Image,ActivityIndicator} from 'react-native';
import 'react-native-gesture-handler';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationContainer } from '@react-navigation/native';
import { auth, db } from '../configs/firebase_config';
import { doc, getDoc } from 'firebase/firestore';

const TelaIndex = ({ navigation }) => {
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'usuarios', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserType(userData.tipo || 'Tutor'); 
          }
        }
      } catch (error) {
        console.error('Erro ao buscar tipo de usuário:', error);
        setUserType('Tutor'); 
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4e2096" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.parteSuperior}>
        <Image
          source={require('../assets/PetLoopLogo.jpg')}
          style={{ width: 250, height: 100 }}
        />
      </View>
      <Text style={styles.titulo}>
        {userType === 'Doador' ? 'Gerenciar Doações' : 'O que você está buscando?'}
      </Text>

      {userType === 'Doador' ? (
        // Cards para Doador
        <>
          <View style={styles.card}>
            <Ionicons name="paw-outline" size={30} color={'#4e2096'} />
            <View style={styles.textContent}>
              <Text style={styles.title}>Meus Animais</Text>
              <Text style={styles.subtitle}>
                Veja e gerencie os animais que você colocou para adoção.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.navigate('MeusAnimais')}
            />
          </View>

          <View style={styles.card}>
            <Ionicons name="add-circle-outline" size={30} color={'#4e2096'} />
            <View style={styles.textContent}>
              <Text style={styles.title}>Colocar Animal para Adoção</Text>
              <Text style={styles.subtitle}>
                Cadastre um novo animal disponível para adoção.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.navigate('CadastrarAnimal')}
            />
          </View>
        </>
      ) : (
        // Cards para Tutor
        <>
          <View style={styles.card}>
            <Ionicons name="home-outline" size={30} color={'#4e2096'} />
            <View style={styles.textContent}>
              <Text style={styles.title}>Adoção</Text>
              <Text style={styles.subtitle}>
                Entre e escolha qual animalzinho será seu.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.navigate('Adocao')}
            />
          </View>

          <View style={styles.card}>
            <MaterialCommunityIcons
              name="bone"
              size={30}
              color={'#4e2096'}
              style={{ transform: [{ rotate: '135deg' }] }}
            />
            <View style={styles.textContent}>
              <Text style={styles.title}>Treinamento</Text>
              <Text style={styles.subtitle}>
                Os melhores treinamentos para seu pet de apoio.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.navigate('Buscar Videos')}
            />
          </View>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  parteSuperior: {
    alignItems: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  titulo: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fea740',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#5E2D8C',
    borderWidth: 2,
    borderRadius: 20,
    padding: 15,
    backgroundColor: '#F9F7F7',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 15,
  },
  textContent: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#5E2D8C',
    marginBottom: 4,
  },
  subtitle: {
    color: '#555',
    fontSize: 14,
  },
  circleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5E2D8C',
  },
});

export default TelaIndex;
