import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, Linking } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


export default function TelaTreinamentos() {
  const [selectedCard, setSelectedCard] = useState(null);
  const navigation = useNavigation();

  const cards = [
    {
      key: 'video1',
      title: 'Primerios Dez Passos para treinar um Cão de Serviço',
      thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_1/hqdefault.jpg', 
      videoUrl: 'https://www.youtube.com/watch?v=dY8ajyiZgIY', 
      duration: '5:30',
      instructor: 'João Silva',
      description: 'Aprenda a técnica mais eficiente para ensinar o comando "sentar" ao seu cachorro de forma positiva e divertida.'
    },
    {
      key: 'video2',
      title: 'Técnica para ensinar o passeio Perfeito',
      thumbnail: 'https://img.youtube.com/vi/VIDEO_ID_2/hqdefault.jpg', 
      videoUrl: 'https://www.youtube.com/watch?v=_x1-MXJFTcc', 
      duration: '8:15',
      instructor: 'Maria Santos',
      description: 'Descubra como fazer seu cachorro parar de puxar a guia durante os passeios, tornando o momento mais agradável para ambos.'
    },
  ];
          const defaultThumbnail = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

  return (
    <View style={styles.container}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
  <Text style={styles.backButtonText}>{'<'} </Text>
</TouchableOpacity>

      <Text style={styles.title}>Lista de Treinamentos</Text>
      <Text style={styles.text}>
        Aqui são os treinamentos que você pode assinar!
      </Text>


      {[
        {
          key: 'video1',
          title: 'Técnica para ensinar o passeio Perfeito',
          videoId: '_x1-MXJFTcc',
          thumbnail: defaultThumbnail,
        },
        {
          key: 'video2',
          title: 'Treinamento para deficientes visuais',
          videoId: 'GzOLzZ3NN9A',
          thumbnail: defaultThumbnail,
        },
        {
          key: 'video3',
          title: 'Treinamento Básico para Cães',
          videoId: 'dY8ajyiZgIY',
          thumbnail: defaultThumbnail,
        },
      ].map((card) => (
        <TouchableOpacity
          key={card.key}
          style={styles.card}
          onPress={() => setSelectedCard(card)}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: card.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>{card.title}</Text>
          </View>
          <Ionicons
            name="play-circle-outline"
            size={24}
            color="#4E2096"
            style={styles.playIcon}
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
            <Image 
              source={{ uri: selectedCard?.thumbnail }}
              style={styles.modalThumbnail}
              resizeMode="cover"
            />
            <Text style={styles.modalTitle}>{selectedCard?.title}</Text>

            <TouchableOpacity 
              style={styles.watchButton}
              onPress={() => {
                if (selectedCard?.videoId) {
                  Linking.openURL(`https://www.youtube.com/watch?v=${selectedCard.videoId}`);
                }
              }}
            >
              <Ionicons name="logo-youtube" size={20} color="#FFF" style={styles.watchIcon} />
              <Text style={styles.watchButtonText}>Assistir no YouTube</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setSelectedCard(null)} 
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
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
    borderWidth: 2,
    borderColor: '#4E2096',
    borderRadius: 15,
    marginVertical: 10,
    backgroundColor: '#F8F5F5',
    overflow: 'hidden',
    flexDirection: 'row',
    height: 100,
  },
  thumbnail: {
    width: 140,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    color: '#4E2096',
    fontWeight: 'bold',
    marginRight: 25,
  },
  
  playIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 0,
    elevation: 5,
    maxHeight: '80%',
  },
  modalThumbnail: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4E2096',
    margin: 15,
  },
  modalInfo: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  modalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  modalDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  watchButton: {
    backgroundColor: '#FF0000',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  watchIcon: {
    marginRight: 5,
  },
  closeButton: {
    backgroundColor: '#4E2096',
    margin: 15,
    marginTop: 0,
    padding: 15,
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
});

