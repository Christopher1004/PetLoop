import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


export default function TelaTreinamentos() {
  const [selectedCard, setSelectedCard] = useState(null);
  const navigation = useNavigation();

  const cards = [
    {
      key: 'card1',
      title: 'Treinamento Básico',
      fullDescription:
        'Focado na obediência fundamental, ensina comandos simples como sentar, ficar, vir, junto e não. Ideal para garantir boa convivência em casa e passeios. Também ajuda a corrigir comportamentos indesejados, como pular nas pessoas ou puxar a guia.',
    },
    {
      key: 'card2',
      title: 'Treinamento Intermediário',
      fullDescription:
        'Aprimora os comandos já ensinados e introduz novas modalidades como comandos à distância, permanência por mais tempo e com distrações.',
    },
    {
      key: 'card3',
      title: 'Treinamento Avançado',
      fullDescription:
        'Para cães que já dominam os níveis anteriores. Inclui comandos avançados, foco intenso e obediência mesmo com distrações severas.',
    },
  ];

  return (
    <View style={styles.container}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Text style={styles.backButtonText}>{'<'} </Text>
</TouchableOpacity>

      <Text style={styles.title}>Lista de Treinamentos</Text>
      <Text style={styles.text}>
        Aqui são os treinamentos que você pode assinar!
      </Text>

      {cards.map(({ key, title, fullDescription }) => (
        <TouchableOpacity
          key={key}
          style={styles.card}
          onPress={() => setSelectedCard({ title, fullDescription })}
          activeOpacity={0.7}
        >
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardText}>Toque para ver mais detalhes</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#4E2096"
            style={styles.cardArrow}
          />
        </TouchableOpacity>
      ))}

      <Modal
  visible={!!selectedCard}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setSelectedCard(null)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>{selectedCard?.title}</Text>
      <Text style={styles.modalDescription}>{selectedCard?.fullDescription}</Text>
      <TouchableOpacity style={styles.assinarButton} onPress={() => alert('Assinado!')}>
        <Text style={styles.assinarButtonText}>Assinar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setSelectedCard(null)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Fechar</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
     padding: 20,
      backgroundColor: '#FFF'
       },
  title: { 
    fontSize: 22,
   fontWeight: 'bold',
    marginBottom: 10,
     color: '#4E2096'
      },
  text: { 
    fontSize: 16,
     color: '#333',
      marginBottom: 15
   },
  card: {
    borderWidth: 3,
    borderColor: '#4E2096',
    borderRadius: 20,
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#F8F5F5',
    position: 'relative',
   },
  cardTitle: { 
    fontSize: 18,
    color: '#4E2096',
    fontWeight: 'bold'
   },
  cardText: { 
    color: '#6A6A6A',
    marginTop: 5,
    marginRight: 25
   },
  cardArrow: { 
    position: 'absolute',
    right: 15,
    bottom: 15
   },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4E2096',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#4E2096',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  backButton: {
  marginBottom: 15,
 },
backButtonText: {
  fontSize: 30,
  color: '#4E2096',
 },
assinarButton: {
  backgroundColor: '#FFA500', 
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
  marginBottom: 15, 
},
assinarButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

});
