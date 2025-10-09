import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { auth } from '../configs/firebase_config';

const Adocao = ({ navigation }) => {
  const [formAbertoId, setFormAbertoId] = useState(null);
  const [comprovante, setComprovante] = useState(null);
  const [comprovanteNome, setComprovanteNome] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    cpf: ''
  });
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [termoGerado, setTermoGerado] = useState(null);
  const [termoNome, setTermoNome] = useState(null);

  // Carrega dados do usuário ao montar o componente
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserData(prev => ({
        ...prev,
        nome: user.displayName || 'Usuário',
        email: user.email || ''
      }));
    }
  }, []);

  const handleUploadComprovante = async () => {
    try {
      console.log('Iniciando seleção de documento...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      console.log('Resultado da seleção:', result);

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('Arquivo selecionado:', file);

        // Verifica o tamanho do arquivo (limite de 5MB)
        const fileSize = file.size;
        const maxSize = 5 * 1024 * 1024; // 5MB em bytes

        if (fileSize > maxSize) {
          Alert.alert('Erro', 'O arquivo é muito grande. Selecione um arquivo menor que 5MB.');
          return;
        }

        // Atualiza o estado com as informações do arquivo
        setComprovante(file);
        setComprovanteNome(file.name);
        console.log('Documento anexado com sucesso:', file.name);
      } else {
        console.log('Seleção cancelada ou sem arquivo');
      }
    } catch (error) {
      console.log('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Não foi possível selecionar o documento. Tente novamente.');
    }
  };

  const abrirModalTermo = (animal) => {
    try {
      setAnimalSelecionado(animal);
      console.log('Animal selecionado:', animal);
      setTimeout(() => {
        setModalVisible(true);
        console.log('Modal aberto');
      }, 100);
    } catch (error) {
      console.error('Erro ao abrir modal:', error);
      Alert.alert('Erro', 'Houve um problema ao abrir o formulário. Tente novamente.');
    }
  };

  const gerarTermo = async () => {
    try {
      setIsLoading(true);
      
      // Validar formato do CPF primeiro
      const cpfLimpo = userData.cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        setIsLoading(false);
        Alert.alert('CPF inválido', 'Por favor, digite os 11 dígitos do CPF.');
        return;
      }

      // Validações rápidas
      if (!userData.cpf || !comprovante || !animalSelecionado) {
        setIsLoading(false);
        Alert.alert('Erro', 'Por favor, preencha todos os campos necessários.');
        return;
      }

    const fileName = `termo_adocao_${Date.now()}.txt`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    const conteudoTermo = [
      'TERMO DE RESPONSABILIDADE DE ADOÇÃO\n',
      `Data: ${new Date().toLocaleDateString()}\n`,
      `Nome do Adotante: ${userData.nome}`,
      `E-mail: ${userData.email}`,
      `CPF: ${userData.cpf}`,
      `Animal: ${animalSelecionado.nome}\n`,
      'Declaro estar ciente das responsabilidades de adotar um animal de estimação,',
      'comprometendo-me a proporcionar todos os cuidados necessários para seu bem-estar.\n',
      'Assinatura: _____________________________',
      userData.nome,
      `CPF: ${userData.cpf}`
    ].join('\n');

    try {
      await FileSystem.writeAsStringAsync(fileUri, conteudoTermo)
        .then(() => {
          setTermoGerado({
            uri: fileUri,
            tipo: 'text/plain',
            name: fileName
          });
          setTermoNome(fileName);
          setModalVisible(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.error('Erro ao gerar termo:', error);
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível gerar o termo. Tente novamente.');
    }
  } catch (error) {
    console.error('Erro ao gerar termo:', error);
    setIsLoading(false);
    Alert.alert('Erro', 'Não foi possível gerar o termo. Tente novamente.');
  }
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

                <View style={styles.comprovanteContainer}>
                  {!comprovante ? (
                    <TouchableOpacity
                      style={styles.botaoUpload}
                      onPress={handleUploadComprovante}
                    >
                      <Text style={styles.textoUpload}>Anexar comprovante de residência</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.comprovanteInfo}>
                      <View style={styles.arquivoInfo}>
                        <Text style={styles.comprovanteNome} numberOfLines={1} ellipsizeMode="middle">
                          {comprovanteNome}
                        </Text>
                        <Text style={styles.comprovanteData}>
                          {new Date().toLocaleDateString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setComprovante(null);
                          setComprovanteNome(null);
                        }}
                        style={styles.botaoRemover}
                      >
                        <Text style={styles.textoRemover}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {!termoGerado ? (
                  <TouchableOpacity
                    style={styles.botaoGerarTermo}
                    onPress={() => {
                      console.log('Botão clicado para o card:', card);
                      abrirModalTermo(card);
                    }}
                  >
                    <Text style={styles.textoBotaoTermo}>Gerar termo de responsabilidade</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.termoContainer}>
                    <TouchableOpacity
                      style={styles.termoGerado}
                      onPress={async () => {
                        try {
                          const content = await FileSystem.readAsStringAsync(termoGerado.uri);
                          Alert.alert(
                            'Termo de Responsabilidade',
                            content,
                            [{ text: 'Fechar' }]
                          );
                        } catch (error) {
                          Alert.alert('Erro', 'Não foi possível abrir o termo.');
                        }
                      }}
                    >
                      <Text style={styles.termoNome}>{termoNome}</Text>
                      <Text style={styles.termoData}>{new Date().toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.botaoRemoverTermo}
                      onPress={() => {
                        Alert.alert(
                          'Remover Termo',
                          'Tem certeza que deseja remover o termo de responsabilidade?',
                          [
                            {
                              text: 'Cancelar',
                              style: 'cancel'
                            },
                            {
                              text: 'Remover',
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  await FileSystem.deleteAsync(termoGerado.uri);
                                  setTermoGerado(null);
                                  setTermoNome(null);
                                } catch (error) {
                                  Alert.alert('Erro', 'Não foi possível remover o termo.');
                                }
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={styles.textoRemover}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.botoesContainer}>
                  <TouchableOpacity
                    style={[styles.botaoAcao, styles.botaoCancelar]}
                    onPress={() => {
                      setFormAbertoId(null);
                      setComprovante(null);
                      setComprovanteNome(null);
                    }}
                  >
                    <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.botaoAcao, styles.botaoEnviar]}
                    onPress={() => {
                      if (!comprovante) {
                        Alert.alert('Erro', 'Por favor, anexe o comprovante de residência');
                        return;
                      }
                      Alert.alert('Sucesso', 'Solicitação de adoção enviada com sucesso!');
                      setFormAbertoId(null);
                      setComprovante(null);
                      setComprovanteNome(null);
                    }}
                  >
                    <Text style={styles.textoBotaoEnviar}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Modal do Termo de Responsabilidade */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log('Modal fechando');
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Termo de Responsabilidade</Text>
            
            <View style={styles.modalForm}>
              <Text style={styles.label}>Nome:</Text>
              <Text style={styles.dadosUsuario}>{userData.nome}</Text>

              <Text style={styles.label}>E-mail:</Text>
              <Text style={styles.dadosUsuario}>{userData.email}</Text>

              <Text style={styles.label}>CPF:</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu CPF"
                value={userData.cpf}
                onChangeText={(text) => setUserData(prev => ({...prev, cpf: text.replace(/\D/g, '')}))}
                keyboardType="numeric"
                maxLength={11}
              />


            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancelar]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonTextCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.buttonConfirmar]}
                onPress={gerarTermo}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonTextConfirmar}>Gerar Termo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4e2096',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalForm: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  dadosUsuario: {
    fontSize: 16,
    color: '#4e2096',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  buttonCancelar: {
    backgroundColor: '#ccc',
  },
  buttonConfirmar: {
    backgroundColor: '#4e2096',
  },
  buttonTextCancelar: {
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonTextConfirmar: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  comprovanteContainer: {
    marginTop: 15,
    width: '100%',
  },
  comprovanteInfo: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4e2096',
  },
  arquivoInfo: {
    flex: 1,
    marginRight: 10,
  },
  comprovanteNome: {
    color: '#4e2096',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  comprovanteData: {
    color: '#666',
    fontSize: 12,
  },
  botaoRemover: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  textoRemover: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  botaoAcao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 5,
  },
  botaoCancelar: {
    backgroundColor: '#ccc',
  },
  botaoEnviar: {
    backgroundColor: '#4CAF50',
  },
  textoBotaoCancelar: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textoBotaoEnviar: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
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
  termoContainer: {
    marginTop: 15,
    width: '100%',
  },
  termoGerado: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#4e2096',
    marginBottom: 8,
  },
  termoNome: {
    color: '#4e2096',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  termoData: {
    color: '#666',
    fontSize: 12,
  },
  botaoRemoverTermo: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
});

export default Adocao;
