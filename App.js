import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createDrawerNavigator } from '@react-navigation/drawer';



const Drawer = createDrawerNavigator();
import TelaLogin from './pages/login';
import TelaCadastro from './pages/cadastro';

import TelaIndex from './pages/index';
import TelaPerfil from './pages/perfil';
import BuscarTreinamento from './pages/buscarTreinamento';
import TelaContato from './pages/Contato';
import TelaTreinamentos from './pages/TelaTreinamento';
import MeusTreinamentos from './pages/MeusTreinamentos';
import AulasConcluidas from './pages/AulasConcluidas';
import VideoAulasRestantes from './pages/VideoAulasRestantes';
import Adocao from './pages/Adocao';

function NavDrawer({ route }) {
  const initialRoute = route?.params?.screen || 'Inicio';

  return (
    <Drawer.Navigator
      initialRouteName={initialRoute}
      drawerPosition="right"
      drawerType="front"
      screenOptions={({ navigation }) => ({
        headerTitle: '',
        drawerStyle: {
          width: 200,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        },
        headerLeft: () => null,
        headerRight: () => (
          <Ionicons
            name="menu"
            size={30}
            color="#5E2D8C"
            onPress={() => navigation.openDrawer()}
            style={{ marginRight: 15 }}
          />
        ),
      })}
    >
      <Drawer.Screen
        name="Inicio"
        component={TelaIndex}
        options={{ headerShown: true }}
      />
      <Drawer.Screen
        name="Perfil"
        component={TelaPerfil}
        options={{ headerShown: true }}
      />
      <Drawer.Screen
        name="Contato"
        component={TelaContato}
        options={{ headerShown: true }}
      />
    </Drawer.Navigator>
  );
}

const Stack = createNativeStackNavigator();

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
