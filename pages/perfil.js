import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { auth, db } from '../configs/firebase_config';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { authService } from '../services/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Or 

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

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
      </View>

      <View style={styles.navigationSection}>
        <TouchableOpacity
          style={styles.navigationItem}
          onPress={() => setIsConfigExpanded(!isConfigExpanded)}>
          <Text style={styles.navigationItemText}>Configurações</Text>
          <Icon 
            name={isConfigExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="gray" 
          />
        </TouchableOpacity>
        
        {isConfigExpanded && (
          <View style={styles.expandedSection}>
            {!isEditingName ? (
              <TouchableOpacity
                style={styles.expandedItem}
                onPress={() => {
                  setNewName(userData.name);
                  setIsEditingName(true);
                }}>
                <Icon name="account-edit" size={20} color={'#4e2096'} style={{ marginRight: 10 }} />
                <Text style={styles.expandedItemText}>Editar Nome</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.editNameInput}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Digite seu nome"
                  placeholderTextColor="#999"
                  autoFocus
                />
                <View style={styles.editNameButtons}>
                  <TouchableOpacity
                    style={[styles.editNameBtn, styles.cancelEditBtn]}
                    onPress={() => {
                      setIsEditingName(false);
                      setNewName('');
                    }}>
                    <Text style={styles.cancelEditText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editNameBtn, styles.saveEditBtn]}
                    onPress={async () => {
                      try {
                        const user = auth.currentUser;
                        if (user && newName.trim() !== '') {
                          // Atualiza o displayName no Firebase Auth
                          await updateProfile(user, {
                            displayName: newName
                          });

                          // Atualiza o nome no Firestore
                          const userDocRef = doc(db, 'usuarios', user.uid);
                          await updateDoc(userDocRef, {
                            nome: newName
                          });

                          setUserData(prev => ({
                            ...prev,
                            name: newName
                          }));
                          setIsEditingName(false);
                          
                          if (Platform.OS === 'web') {
                            alert('Nome atualizado com sucesso!');
                          } else {
                            Alert.alert('Sucesso', 'Nome atualizado com sucesso!');
                          }
                        } else if (newName.trim() === '') {
                          if (Platform.OS === 'web') {
                            alert('Por favor, digite um nome válido.');
                          } else {
                            Alert.alert('Aviso', 'Por favor, digite um nome válido.');
                          }
                        }
                      } catch (error) {
                        console.error('Erro ao atualizar nome:', error);
                        if (Platform.OS === 'web') {
                          alert('Não foi possível atualizar o nome: ' + error.message);
                        } else {
                          Alert.alert('Erro', 'Não foi possível atualizar o nome.');
                        }
                      }
                    }}>
                    <Text style={styles.saveEditText}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.navigationItem}
          onPress={() => console.log('Sobre o Aplicativo')}>
          <Text style={styles.navigationItemText}>Sobre o Aplicativo</Text>
          <Icon name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#F5F5F5',
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
  expandedSection: {
    backgroundColor: '#F9F9F9',
    paddingVertical: 5,
  },
  expandedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 25,
  },
  expandedItemText: {
    fontSize: 15,
    color: '#4e2096',
  },
  editNameContainer: {
    padding: 15,
    paddingLeft: 25,
  },
  editNameInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editNameBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelEditBtn: {
    backgroundColor: '#E0E0E0',
  },
  saveEditBtn: {
    backgroundColor: '#4e2096',
  },
  cancelEditText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveEditText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
