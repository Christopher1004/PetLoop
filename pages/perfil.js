import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { auth } from '../configs/firebase_config';
import { signOut } from 'firebase/auth';
import { authService } from '../services/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Or 

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserData({
        name: user.displayName || 'Usuário',
        email: user.email || ''
      });
    }
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          onPress: async () => {
            try {
              console.log('Iniciando processo de logout...');
              // Tenta fazer logout do Firebase diretamente
              await signOut(auth);
              console.log('Logout do Firebase realizado');
              
              // Limpa as credenciais salvas
              await authService.clearSavedCredentials();
              console.log('Credenciais locais limpas');
              
              // Navega para a tela de login
              navigation.reset({
                index: 0,
                routes: [{ name: 'Entrar' }]
              });
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível sair da conta.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Seu Perfil</Text>

      <View style={styles.profileCard}>
        <Icon
          name="account-circle"
          size={40}
          color={'#4e2096'}
          style={styles.profileIcon}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
        </View>
        <TouchableOpacity onPress={() => console.log('Edit Profile')}>
          <Icon name="pencil" size={20} color={'#4e2096'} />
        </TouchableOpacity>
      </View>

      <View style={styles.navigationSection}>
        <TouchableOpacity
          style={styles.navigationItem}
          onPress={() => console.log('Go to Your Aid Pet')}>
          <Text style={styles.navigationItemText}>Seu Pet de Auxílio</Text>
          <Icon name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigationItem}
          onPress={() => console.log('Go to Your Trainings')}>
          <Text style={styles.navigationItemText}>Seus Treinamentos</Text>
          <Icon name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.premiumButton}
        onPress={() => console.log('Go to Premium Version')}>
        <Text style={styles.premiumButtonText}>Versão Premium</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          console.log('Botão de logout pressionado');
          
          const handleLogoutConfirmed = async () => {
            try {
              console.log('Iniciando processo de logout...');
              await signOut(auth);
              console.log('Logout do Firebase realizado');
              
              await authService.clearSavedCredentials();
              console.log('Credenciais locais limpas');
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'Entrar' }]
              });
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              Alert.alert('Erro', 'Não foi possível sair da conta.');
            }
          };

          const handleLogoutCanceled = () => {
            console.log('Logout cancelado pelo usuário');
          };

          if (Platform.OS === 'web') {
            // Para web, usar confirm nativo
            if (window.confirm('Tem certeza que deseja sair?')) {
              handleLogoutConfirmed();
            } else {
              handleLogoutCanceled();
            }
          } else {
            // Para mobile, usar Alert do React Native
            Alert.alert(
              'Sair da Conta',
              'Tem certeza que deseja sair?',
              [
                {
                  text: 'Cancelar',
                  onPress: handleLogoutCanceled,
                  style: 'cancel',
                },
                {
                  text: 'Sair',
                  onPress: handleLogoutConfirmed,
                  style: 'destructive',
                },
              ],
              { cancelable: false }
            );
          }
        }}>
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightBackground',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fea740', 
    marginBottom: 30,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileIcon: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e2096',
  },
  profileEmail: {
    fontSize: 14,
    color: 'lightGray',
  },
  navigationSection: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 40,
  },
  navigationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  navigationItemText: {
    fontSize: 16,
    color: 'lightGray',
  },
  premiumButton: {
    backgroundColor: '#fea740',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginTop: 20,
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProfileScreen;
