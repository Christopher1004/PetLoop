import React from 'react';
import {View,Text,StyleSheet,TouchableOpacity,} from 'react-native';
import * as Progress from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';

export default function MeusTreinamentos() {
  const navigation = useNavigation();
  const progresso = 0.7;

  return (
    <View style={styles.container}>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>{'<'} </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.header}>Progresso do Treinamento</Text>

        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Treinamento Básico</Text>

          <Progress.Bar
            progress={progresso}
            width={250}
            color="#FFA836"
            borderRadius={20}
            height={12}
            unfilledColor="#FFE2B6"
            borderWidth={0}
          />

          <Text style={styles.progressoTexto}>{Math.round(progresso * 100)}% concluído</Text>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('AulasConcluidas')}>
            <Text style={styles.cardSection}>Aulas Concluídas {'>'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('VideoAulasRestantes')}>
            <Text style={styles.cardSectionSecondary}>Vídeo Aulas • 5 restantes {'>'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cancelarBtn}>
          <Text style={styles.cancelarTxt}>Cancelar assinatura</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F7',
    justifyContent: 'center',  
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',  
    top: 40,             
    left: 20,             
  },
  backButtonText: {
    fontSize: 30,
    color: '#4E2096',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    color: '#FFA836',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4E2096',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    width: 300,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    color: '#4E2096',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressoTexto: {
    marginTop: 8,
    color: '#2E8B57',
    fontWeight: '500',
  },
  cardSection: {
    fontSize: 16,
    color: '#2E8B57',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSectionSecondary: {
    fontSize: 14,
    color: '#333',
  },
  cancelarBtn: {
    backgroundColor: '#FFA836',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    width: 300,
  },
  cancelarTxt: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
