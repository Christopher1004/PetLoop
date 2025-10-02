import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import TelaLogin from './pages/login';
import TelaCadastro from './pages/cadastro';
import TelaIndex from './pages/index';
import TelaPerfil from './pages/perfil';
import TelaContato from './pages/Contato';
import BuscarTreinamento from './pages/buscarTreinamento';
import TelaTreinamentos from './pages/TelaTreinamento';
import MeusTreinamentos from './pages/MeusTreinamentos';
import AulasConcluidas from './pages/AulasConcluidas';
import VideoAulasRestantes from './pages/VideoAulasRestantes';
import Adocao from './pages/Adocao';

const Stack = createNativeStackNavigator();
const SCREEN_WIDTH = Dimensions.get('window').width;

function NavDrawer({ route }) {
  const initialRoute = route?.params?.screen || 'Inicio';
  const [drawerVisible, setDrawerVisible] = useState(false);
  const drawerWidth = 200;
  // Valor inicia em 0, que significa drawer fechado (right: drawerWidth - 0 = 200)
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const [currentScreen, setCurrentScreen] = useState(initialRoute);

  const toggleDrawer = () => {
    if (drawerVisible) {
      Animated.timing(drawerAnim, {
        toValue: 0, // fechar drawer
        duration: 300,
        useNativeDriver: false,
      }).start(() => setDrawerVisible(false));
    } else {
      setDrawerVisible(true);
      Animated.timing(drawerAnim, {
        toValue: drawerWidth, // abrir drawer
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
    toggleDrawer();
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Inicio':
        return <TelaIndex />;
      case 'Perfil':
        return <TelaPerfil />;
      case 'Contato':
        return <TelaContato />;
      default:
        return <TelaIndex />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Cabeçalho com botão de menu */}
      <View style={styles.header}>
        <Ionicons
          name="menu"
          size={30}
          color="#5E2D8C"
          onPress={toggleDrawer}
          style={{ marginRight: 15 }}
        />
      </View>

      {/* Conteúdo principal */}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Overlay que fecha o drawer */}
      {drawerVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleDrawer}
        />
      )}

      {/* Drawer lateral */}
      <Animated.View style={[styles.drawer, { right: drawerWidth - drawerAnim }]}>
        <Text style={styles.drawerTitle}>Menu</Text>
        <TouchableOpacity onPress={() => handleNavigate('Inicio')}>
          <Text style={styles.drawerItem}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigate('Perfil')}>
          <Text style={styles.drawerItem}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleNavigate('Contato')}>
          <Text style={styles.drawerItem}>Contato</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}



export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Entrar"
          component={TelaLogin}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={TelaCadastro}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Drawer"
          component={NavDrawer}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Buscar Treinamento"
          component={BuscarTreinamento}
          options={{
            headerShown: true,
            headerTintColor: '#5E2D8C',
            headerTitleStyle: { color: '#fea740', fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="Treinamentos"
          component={TelaTreinamentos}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Meus treinamentos"
          component={MeusTreinamentos}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AulasConcluidas"
          component={AulasConcluidas}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="VideoAulasRestantes"
          component={VideoAulasRestantes}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Adocao"
          component={Adocao}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    elevation: 3,
    zIndex: 2,
  },
  drawer: {
    position: 'absolute',
    top: 60, // abaixo do header
    width: 200,
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 3,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    elevation: 6,
    maxHeight: 300, // controla altura máxima
  },
  overlay: {
    position: 'absolute',
    top: 60,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 2,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5E2D8C',
  },
  drawerItem: {
    fontSize: 16,
    paddingVertical: 10,
    color: '#5E2D8C',
  },
});