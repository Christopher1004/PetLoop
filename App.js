import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import TelaLogin from "./pages/index";
import TelaCadastro from "./pages/cadastro";

const Stack = createNativeStackNavigator()

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Entrar' component={TelaLogin} />
        <Stack.Screen name='Cadastro' component={TelaCadastro} />
      </Stack.Navigator>
    </NavigationContainer>

  )
}
