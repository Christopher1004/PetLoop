import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Modal, ActivityIndicator, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { auth } from '../configs/firebase_config';

const CustomAlert = ({ visible, title, message, onClose }) => {
  if (!visible) return null;
  
  if (Platform.OS === 'web') {
    // Web alert implementation
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertMessage}>{message}</Text>
            <TouchableOpacity style={styles.alertButton} onPress={onClose}>
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  } else {
    // Native platforms use standard Alert
    Alert.alert(title, message, [{ text: 'OK', onPress: onClose }]);
    return null;
  }
};

const Adocao = ({ navigation }) => {
  const [formAbertoId, setFormAbertoId] = useState(null);
  const [comprovantes, setComprovantes] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisualizarTermo, setModalVisualizarTermo] = useState(false);
  const [termoAtual, setTermoAtual] = useState(null);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: ''
  });
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    cpf: ''
  });
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [termosGerados, setTermosGerados] = useState({});

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

  const handleUploadComprovante = async (cardId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        const fileSize = file.size;
        const maxSize = 5 * 1024 * 1024; 

        if (fileSize > maxSize) {
          setAlertConfig({
            visible: true,
            title: 'Erro',
            message: 'O arquivo é muito grande. Selecione um arquivo menor que 5MB.'
          });
          return;
        }

        setComprovantes(prev => ({
          ...prev,
          [cardId]: {
            file: file,
            nome: file.name
          }
        }));
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível selecionar o documento. Tente novamente.'
      });
    }
  };

  const abrirModalTermo = (animal) => {
    try {
      setAnimalSelecionado(animal);
      setModalVisible(true);
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: 'Erro',
        message: 'Houve um problema ao abrir o formulário. Tente novamente.'
      });
    }
  };

  const gerarTermo = () => {
    try {
      setIsLoading(true);
      
      const cpfLimpo = userData.cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        setIsLoading(false);
        setAlertConfig({
          visible: true,
          title: 'CPF inválido',
          message: 'Por favor, digite os 11 dígitos do CPF.'
        });
        return;
      }

      if (!userData.cpf || !animalSelecionado) {
        setIsLoading(false);
        setAlertConfig({
          visible: true,
          title: 'Erro',
          message: 'Por favor, preencha todos os campos necessários.'
        });
        return;
      }

      const now = new Date();
      const fileName = `termo_adocao_${animalSelecionado.id}_${now.getTime()}.txt`;
      
      const conteudoTermo = [
        'TERMO DE RESPONSABILIDADE DE ADOÇÃO\n',
        `Data: ${now.toLocaleDateString()}`,
        `Hora: ${now.toLocaleTimeString()}\n`,
        `Nome do Adotante: ${userData.nome}`,
        `E-mail: ${userData.email}`,
        `CPF: ${userData.cpf}`,
        `Animal: ${animalSelecionado.nome}\n`,
        'Declaro estar ciente das responsabilidades de adotar um animal de estimação,',
        'comprometendo-me a proporcionar todos os cuidados necessários para seu bem-estar,',
        'incluindo alimentação adequada, cuidados veterinários, abrigo e carinho.\n',
        userData.nome,
        `CPF: ${userData.cpf}`
      ].join('\n');

      const novoTermo = {
        conteudo: conteudoTermo,
        tipo: 'text/plain',
        nome: fileName,
        data: now.toLocaleDateString()
      };

      setTermosGerados(prev => ({
        ...prev,
        [animalSelecionado.id]: novoTermo
      }));
      
      setModalVisible(false);
      setTermoAtual(novoTermo);
      setModalVisualizarTermo(true);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setAlertConfig({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível gerar o termo. Tente novamente.'
      });
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
                  {!comprovantes[card.id] ? (
                    <TouchableOpacity
                      style={styles.botaoUpload}
                      onPress={() => handleUploadComprovante(card.id)}
                    >
                      <Text style={styles.textoUpload}>Anexar comprovante de residência</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.comprovanteInfo}>
                      <View style={styles.arquivoInfo}>
                        <Text style={styles.comprovanteNome} numberOfLines={1} ellipsizeMode="middle">
                          {comprovantes[card.id].nome}
                        </Text>
                        <Text style={styles.comprovanteData}>
                          {new Date().toLocaleDateString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setComprovantes(prev => {
                            const novo = {...prev};
                            delete novo[card.id];
                            return novo;
                          });
                        }}
                        style={styles.botaoRemover}
                      >
                        <Text style={styles.textoRemover}>Remover</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {!termosGerados[card.id] ? (
                  <TouchableOpacity
                    style={styles.botaoGerarTermo}
                    onPress={() => abrirModalTermo(card)}
                  >
                    <Text style={styles.textoBotaoTermo}>Gerar termo de responsabilidade</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.comprovanteInfo}>
                    <View style={styles.arquivoInfo}>
                      <Text style={styles.comprovanteNome} numberOfLines={1} ellipsizeMode="middle">
                        {termosGerados[card.id].nome}
                      </Text>
                      <Text style={styles.comprovanteData}>
                        {termosGerados[card.id].data}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        try {
                          setTermoAtual(termosGerados[card.id]);
                          setModalVisualizarTermo(true);
                        } catch (error) {
                          setAlertConfig({
                            visible: true,
                            title: 'Erro',
                            message: 'Não foi possível abrir o termo.'
                          });
                        }
                      }}
                      style={styles.botaoVisualizar}
                    >
                      <Text style={styles.textoVisualizar}>Visualizar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.botoesContainer}>
                  <TouchableOpacity
                    style={[styles.botaoAcao, styles.botaoCancelar]}
                    onPress={() => {
                      setFormAbertoId(null);
                      // Limpar comprovante
                      setComprovantes(prev => {
                        const novo = {...prev};
                        delete novo[card.id];
                        return novo;
                      });
                      // Limpar termo gerado
                      setTermosGerados(prev => {
                        const novo = {...prev};
                        delete novo[card.id];
                        return novo;
                      });
                      // Limpar CPF
                      setUserData(prev => ({
                        ...prev,
                        cpf: ''
                      }));
                    }}
                  >
                    <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.botaoAcao,
                      styles.botaoEnviar,
                      (!comprovantes[card.id] || !termosGerados[card.id]) && styles.botaoEnviarDesabilitado
                    ]}
                    onPress={() => {
                      if (!comprovantes[card.id] || !termosGerados[card.id]) {
                        let mensagem = [];
                        if (!comprovantes[card.id]) mensagem.push('comprovante de residência');
                        if (!termosGerados[card.id]) mensagem.push('termo de responsabilidade');
                        
                        setAlertConfig({
                          visible: true,
                          title: 'Documentos Pendentes',
                          message: `Por favor, anexe o(s) seguinte(s) documento(s): ${mensagem.join(' e ')}.`
                        });
                        return;
                      }
                      setAlertConfig({
                        visible: true,
                        title: 'Sucesso',
                        message: 'Solicitação de adoção enviada com sucesso!'
                      });
                      // Limpar tudo após o envio
                      setFormAbertoId(null);
                      setComprovantes(prev => {
                        const novo = {...prev};
                        delete novo[card.id];
                        return novo;
                      });
                      setTermosGerados(prev => {
                        const novo = {...prev};
                        delete novo[card.id];
                        return novo;
                      });
                      setUserData(prev => ({
                        ...prev,
                        cpf: ''
                      }));
                    }}
                  >
                    <Text style={[
                      styles.textoBotaoEnviar,
                      (!comprovantes[card.id] || !termosGerados[card.id]) && styles.textoBotaoEnviarDesabilitado
                    ]}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisualizarTermo}
        onRequestClose={() => setModalVisualizarTermo(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.termoHeader}>
              <Text style={styles.termoTitle}>Termo de Responsabilidade</Text>
            </View>
            
            <ScrollView style={styles.termoScroll}>
              <View style={styles.termoContainer}>
                <Text style={styles.termoConteudo} selectable>
                  {termoAtual?.conteudo || ''}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.buttonCancelar]}
                onPress={() => setModalVisualizarTermo(false)}
              >
                <Text style={styles.buttonTextCancelar}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  termoModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 0,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  termoHeader: {
    backgroundColor: '#4e2096',
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
  },
  termoTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  termoSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.8,
  },
  termoContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  termoScroll: {
    backgroundColor: '#ffffff',
  },
  termoConteudo: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonFechar: {
    backgroundColor: '#4e2096',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  buttonTextFechar: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  alertBox: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4e2096',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  alertButton: {
    backgroundColor: '#4e2096',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
  botaoVisualizar: {
    backgroundColor: '#4e2096',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  textoVisualizar: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
  botaoEnviarDesabilitado: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
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
  textoBotaoEnviarDesabilitado: {
    color: 'rgba(255, 255, 255, 0.8)',
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
  termoGeradoContainer: {
    marginTop: 15,
    width: '100%',
  },
  botaoRemoverTermo: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  termoHeader: {
    backgroundColor: '#4e2096',
    padding: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 10,
  },
  termoTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  termoScroll: {
    maxHeight: '80%',
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  termoContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  termoConteudo: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default Adocao;
