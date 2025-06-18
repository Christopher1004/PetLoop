import React, { useState } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function BuscarTreinamento({ navigation }) {
  const [animalSelecionado, setAnimalSelecionado] = useState(null);

  const animais = ['Cães', 'Cavalos', 'Gatos', 'Macacos'];

  return (
    <View style={styles.container}>

      <View style={styles.buttonsRow}>
        {animais.map((animal, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tagButton,
              animalSelecionado === animal && styles.tagButtonSelecionado,
            ]}
            onPress={() => setAnimalSelecionado(animal)}
          >
            <Text
              style={[
                styles.tagText,
                animalSelecionado === animal && styles.tagTextSelecionado,
              ]}
            >
              {animal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (animalSelecionado) {
            navigation.navigate('Treinamentos', { animal: animalSelecionado });
          } else {
            alert('Selecione um animal antes de continuar.');
          }
        }}
      >
        <Text style={styles.cardTitle}>Treinamentos</Text>
        <Text style={styles.cardText}>
          Veja os treinamentos disponíveis para assinatura.
        </Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color="#4E2096"
          style={styles.cardArrow}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (animalSelecionado) {
            navigation.navigate('Meus treinamentos', { animal: animalSelecionado });
          } else {
            alert('Selecione um animal antes de continuar.');
          }
        }}
      >
        <Text style={styles.cardTitle}>Meus treinamentos</Text>
        <Text style={styles.cardText}>
          Aqui você encontrará os treinamentos que assinou.
        </Text>
        <Ionicons
          name="arrow-forward"
          size={20}
          color="#4E2096"
          style={styles.cardArrow}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
    padding: 20,
    backgroundColor: '#FAF7F7',
    flex: 1 
    },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginBottom: 10,
  },
  tagButton: {
    borderWidth: 2,
    borderColor: '#F7941D',
    paddingVertical: 8,
    paddingHorizontal: 12, 
    borderRadius: 20,
    marginBottom: 8,
  },
  tagButtonSelecionado: {
  backgroundColor: '#F7941D', 
  borderColor: '#F7941D',
},
  tagText: { 
    color: '#F7941D',
     fontWeight: 'bold'
      },
  tagTextSelecionado: {
  color: '#FFF',
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
});
