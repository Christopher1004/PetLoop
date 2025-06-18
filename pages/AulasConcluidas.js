import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';


export default function AulasConcluidas({ navigation }) {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aulas Concluídas</Text>


      <Text style={styles.description}>
        Aqui estão as aulas que você já concluiu. Continue avançando para completar seu treinamento!
      </Text>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F7',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4E2096',
    marginVertical: 15,
  },
  description: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#FFA836',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
