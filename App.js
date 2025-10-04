import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { authService } from './services/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
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
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 3,
        },
        headerTintColor: '#5E2D8C',
        drawerPosition: 'right',
        drawerStyle: {
          width: '50%',
          height: '28%',
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          marginTop: '10px', // isso vai posicionar o drawer um pouco abaixo do topo
        },
        drawerLabelStyle: {
          color: '#5E2D8C',
          fontSize: 16,
        },
        drawerActiveBackgroundColor: 'rgba(94, 45, 140, 0.1)',
        drawerActiveTintColor: '#5E2D8C',
      }}
    >
      <Drawer.Screen
        name="Inicio"
        component={TelaIndex}
        options={{
          title: 'Início',
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Perfil"
        component={TelaPerfil}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Contato"
        component={TelaContato}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="mail-outline" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}



export default function StackNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        console.log('=== Início da Verificação de Autenticação ===');
        const credentials = await authService.getSavedCredentials();
        const rememberMe = await authService.isRememberMeActive();
        
        console.log('Estado atual:', {
          temCredenciais: credentials ? 'Sim' : 'Não',
          lembrarDeMim: rememberMe ? 'Sim' : 'Não',
          email: credentials?.email || 'Nenhum'
        });
        
        if (credentials && rememberMe) {
          console.log('Iniciando login automático...');
          await authService.login(credentials.email, credentials.password, true);
          console.log('Login automático realizado com sucesso!');
          setIsAuthenticated(true);
        } else {
          console.log('Login automático não necessário:', {
            motivo: !credentials ? 'Sem credenciais' : 'Lembrar de mim desativado'
          });
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erro durante verificação de autenticação:', error);
        setIsAuthenticated(false);
        await authService.clearSavedCredentials();
      } finally {
        setIsLoading(false);
        console.log('=== Fim da Verificação de Autenticação ===');
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return null; // ou um componente de loading se preferir
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? 'Drawer' : 'Entrar'}>
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
          component={DrawerNavigator}
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
  // Estilos podem ser adicionados conforme necessário
});