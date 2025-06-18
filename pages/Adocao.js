import React, { useState } from 'react';
import { StyleSheet, Text, View,TouchableOpacity,Image,TextInput,ScrollView,Alert,} from 'react-native';

const Adocao = ({ navigation }) => {
  const [formAbertoId, setFormAbertoId] = useState(null);

  const [rg, setRg] = useState('');
  const [cpf, setCpf] = useState('');
  const [comprovante, setComprovante] = useState(null);

  const handleUploadComprovante = () => {
    Alert.alert('Upload', 'Simulando upload do comprovante');
    setComprovante('arquivo_simulado.pdf');
  };

  const gerarTermo = () => {
    if (!rg || !cpf || !comprovante) {
      Alert.alert('Erro', 'Preencha todos os campos e envie o comprovante.');
      return;
    }
    Alert.alert(
      'Termo de Responsabilidade',
      `RG: ${rg}\nCPF: ${cpf}\nComprovante: ${comprovante}\n\nTermo gerado com sucesso!`
    );
  };

  const cards = [
    {
      id: 1,
      nome: 'Rex - Cachorro',
      imagem: 'https://placedog.net/400/300?id=1',
    },
    {
  id: 2,
  nome: 'Mimi - Cachorro',
  imagem: 'https://placedog.net/401/301?id=2', 
},
    {
      id: 3,
      nome: 'Ursão - Urso',
      imagem: 'https://placebear.com/400/300',
    },
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoVoltar}>Voltar</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {cards.map(card => (
          <View key={card.id} style={styles.card}>
            <Image
              source={{ uri: card.imagem }}
              style={styles.imagem}
              resizeMode="cover"
            />
            <Text style={styles.nomeAnimal}>{card.nome}</Text>

            {!formAbertoId || formAbertoId !== card.id ? (
              <TouchableOpacity
                style={styles.botaoAdotar}
                onPress={() => setFormAbertoId(card.id)}
              >
                <Text style={styles.textoBotaoAdotar}>Adotar</Text>
              </TouchableOpacity>
            ) : (

              <View style={styles.formulario}>
                <TextInput
                  placeholder="RG"
                  value={rg}
                  onChangeText={setRg}
                  style={styles.input}
                />
                <TextInput
                  placeholder="CPF"
                  value={cpf}
                  onChangeText={setCpf}
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={styles.botaoUpload}
                  onPress={handleUploadComprovante}
                >
                  <Text style={styles.textoUpload}>
                    {comprovante ? 'Comprovante enviado' : 'Enviar comprovante de residência'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botaoGerarTermo}
                  onPress={gerarTermo}
                >
                  <Text style={styles.textoBotaoTermo}>Gerar termo de responsabilidade</Text>
                </TouchableOpacity>

            
                <TouchableOpacity
                  style={[styles.botaoAdotar, { backgroundColor: '#ccc', marginTop: 10 }]}
                  onPress={() => {
                    setFormAbertoId(null);
                    setRg('');
                    setCpf('');
                    setComprovante(null);
                  }}
                >
                  <Text style={{ color: '#333' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  botaoVoltar: {
    backgroundColor: '#007bff', 
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  textoVoltar: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardsContainer: {
    gap: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fea740', 
    borderRadius: 15,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imagem: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  nomeAnimal: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#4e2096',
    fontSize: 18,
  },
  botaoAdotar: {
    marginTop: 15,
    backgroundColor: '#4e2096',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  textoBotaoAdotar: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formulario: {
    width: '90%',
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#4e2096',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    color: '#333',
  },
  botaoUpload: {
    marginTop: 15,
    backgroundColor: '#6a4caf',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  textoUpload: {
    color: 'white',
    fontWeight: 'bold',
  },
  botaoGerarTermo: {
    marginTop: 15,
    backgroundColor: '#ff7f50',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  textoBotaoTermo: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Adocao;
