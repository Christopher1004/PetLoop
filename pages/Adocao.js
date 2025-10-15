import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Modal, ActivityIndicator, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, db } from '../configs/firebase_config';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, addDoc, serverTimestamp } from 'firebase/firestore';
import { supabase, STORAGE_BUCKET } from '../configs/supabase_config';

const CustomAlert = ({ visible, title, message, onClose }) => {
  if (!visible) return null;
  
  if (Platform.OS === 'web') {
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
  const [animaisDisponiveis, setAnimaisDisponiveis] = useState([]);
  const [loadingAnimais, setLoadingAnimais] = useState(true);
  const [animaisJaCandidatados, setAnimaisJaCandidatados] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserData(prev => ({
        ...prev,
        nome: user.displayName || 'Usuário',
        email: user.email || ''
      }));
    }
    loadAnimaisDisponiveis();
  }, []);

  // Buscar animais disponíveis do Firestore
  const loadAnimaisDisponiveis = async () => {
    try {
      setLoadingAnimais(true);
      const user = auth.currentUser;
      
      // Buscar animais disponíveis
      const animaisRef = collection(db, 'animais');
      const q = query(animaisRef, where('status', '==', 'Disponível'));
      
      const querySnapshot = await getDocs(q);
      const animaisData = [];
      
      querySnapshot.forEach((doc) => {
        animaisData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar localmente por data de criação (mais recentes primeiro)
      animaisData.sort((a, b) => {
        const dateA = a.criadoEm?.toDate?.() || new Date(0);
        const dateB = b.criadoEm?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setAnimaisDisponiveis(animaisData);

      // Buscar candidaturas do usuário atual
      if (user) {
        const candidaturasRef = collection(db, 'candidaturas');
        const qCandidaturas = query(candidaturasRef, where('candidatoId', '==', user.uid));
        const candidaturasSnapshot = await getDocs(qCandidaturas);
        
        const animaisCandidatados = [];
        candidaturasSnapshot.forEach((doc) => {
          animaisCandidatados.push(doc.data().animalId);
        });
        
        setAnimaisJaCandidatados(animaisCandidatados);
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      setAlertConfig({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível carregar os animais disponíveis.'
      });
    } finally {
      setLoadingAnimais(false);
    }
  };

  const jaSeCandidatou = (animalId) => {
    return animaisJaCandidatados.includes(animalId);
  };

  const handleUploadComprovante = async (cardId) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setAlertConfig({
          visible: true,
          title: 'Permissão negada',
          message: 'Precisamos de permissão para acessar suas fotos.'
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setComprovantes(prev => ({
          ...prev,
          [cardId]: {
            uri: imageUri,
            nome: `comprovante_${cardId}.jpg`,
            uploaded: false 
          }
        }));
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      setAlertConfig({
        visible: true,
        title: 'Erro',
        message: 'Não foi possível selecionar a imagem. Tente novamente.'
      });
    }
  };

  const uploadComprovanteToSupabase = async (imageUri, animalId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `comprovante_${user.uid}_${animalId}_${Date.now()}.${fileExt}`;
      const filePath = `comprovantes/${fileName}`;

      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            upsert: false
          });

        if (error) throw error;
      } else {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, blob, {
            contentType: `image/${fileExt}`,
            upsert: false
          });

        if (error) throw error;
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do comprovante:', error);
      throw error;
    }
  };

  const uploadTermoToSupabase = async (termoConteudo, animalId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const fileName = `termo_${user.uid}_${animalId}_${Date.now()}.txt`;
      const filePath = `termos/${fileName}`;

      const blob = new Blob([termoConteudo], { type: 'text/plain' });

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, blob, {
          contentType: 'text/plain',
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do termo:', error);
      throw error;
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoVoltar}>Voltar</Text>
      </TouchableOpacity>

      {loadingAnimais ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4e2096" />
          <Text style={styles.loadingText}>Carregando animais disponíveis...</Text>
        </View>
      ) : animaisDisponiveis.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum animal disponível para adoção no momento.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {animaisDisponiveis.map(animal => (
            <View key={animal.id} style={styles.card}>
              <Image
                source={{ uri: animal.fotoUrl }}
                style={styles.imagem}
                resizeMode="cover"
              />
              <Text style={styles.nomeAnimal}>{animal.nome} - {animal.tipo}</Text>

              {jaSeCandidatou(animal.id) ? (
                <View style={styles.jaCandidatadoContainer}>
                  <Text style={styles.jaCandidatadoText}>✓ Você já se candidatou a este animal</Text>
                </View>
              ) : !formAbertoId || formAbertoId !== animal.id ? (
                <TouchableOpacity
                  style={styles.botaoAdotar}
                  onPress={() => setFormAbertoId(animal.id)}
                >
                  <Text style={styles.textoBotaoAdotar}>Adotar</Text>
                </TouchableOpacity>
              ) : (

                <View style={styles.formulario}>

                <View style={styles.comprovanteContainer}>
                  {!comprovantes[animal.id] ? (
                    <TouchableOpacity
                      style={styles.botaoUpload}
                      onPress={() => handleUploadComprovante(animal.id)}
                    >
                      <Text style={styles.textoUpload}>Anexar comprovante de residência (Imagem)</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.comprovanteInfo}>
                      <View style={styles.arquivoInfo}>
                        <Text style={styles.comprovanteNome} numberOfLines={1} ellipsizeMode="middle">
                          {comprovantes[animal.id].nome}
                        </Text>
                        <Text style={styles.comprovanteData}>
                          {new Date().toLocaleDateString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setComprovantes(prev => {
                            const novo = {...prev};
                            delete novo[animal.id];
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

                {!termosGerados[animal.id] ? (
                  <TouchableOpacity
                    style={styles.botaoGerarTermo}
                    onPress={() => abrirModalTermo(animal)}
                  >
                    <Text style={styles.textoBotaoTermo}>Gerar termo de responsabilidade</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.comprovanteInfo}>
                    <View style={styles.arquivoInfo}>
                      <Text style={styles.comprovanteNome} numberOfLines={1} ellipsizeMode="middle">
                        {termosGerados[animal.id].nome}
                      </Text>
                      <Text style={styles.comprovanteData}>
                        {termosGerados[animal.id].data}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        try {
                          setTermoAtual(termosGerados[animal.id]);
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
                        delete novo[animal.id];
                        return novo;
                      });
                      // Limpar termo gerado
                      setTermosGerados(prev => {
                        const novo = {...prev};
                        delete novo[animal.id];
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
                      (!comprovantes[animal.id] || !termosGerados[animal.id] || isLoading) && styles.botaoEnviarDesabilitado
                    ]}
                    onPress={async () => {
                      if (!comprovantes[animal.id] || !termosGerados[animal.id]) {
                        let mensagem = [];
                        if (!comprovantes[animal.id]) mensagem.push('comprovante de residência');
                        if (!termosGerados[animal.id]) mensagem.push('termo de responsabilidade');
                        
                        setAlertConfig({
                          visible: true,
                          title: 'Documentos Pendentes',
                          message: `Por favor, anexe o(s) seguinte(s) documento(s): ${mensagem.join(' e ')}.`
                        });
                        return;
                      }

                      try {
                        setIsLoading(true);
                        const user = auth.currentUser;
                        
                        if (!user) {
                          setAlertConfig({
                            visible: true,
                            title: 'Erro',
                            message: 'Usuário não autenticado.'
                          });
                          return;
                        }

                        // 1. Upload do comprovante de residência
                        const comprovanteUrl = await uploadComprovanteToSupabase(
                          comprovantes[animal.id].uri,
                          animal.id
                        );

                        // 2. Upload do termo de responsabilidade
                        const termoUrl = await uploadTermoToSupabase(
                          termosGerados[animal.id].conteudo,
                          animal.id
                        );

                        const candidaturasRef = collection(db, 'candidaturas');
                        await addDoc(candidaturasRef, {
                          animalId: animal.id,
                          animalNome: animal.nome,
                          animalTipo: animal.tipo,
                          doadorId: animal.doadorId,
                          doadorEmail: animal.doadorEmail,
                          candidatoId: user.uid,
                          candidatoNome: userData.nome,
                          candidatoEmail: userData.email,
                          candidatoCPF: userData.cpf,
                          comprovanteUrl: comprovanteUrl,
                          termoUrl: termoUrl,
                          status: 'Pendente',
                          criadoEm: serverTimestamp()
                        });

                        const animalRef = doc(db, 'animais', animal.id);
                        await updateDoc(animalRef, {
                          candidatos: arrayUnion({
                            id: user.uid,
                            nome: userData.nome,
                            email: userData.email,
                            cpf: userData.cpf,
                            comprovanteUrl: comprovanteUrl,
                            termoUrl: termoUrl,
                            dataInscricao: new Date().toISOString()
                          })
                        });

                        setAlertConfig({
                          visible: true,
                          title: 'Sucesso',
                          message: 'Solicitação de adoção enviada com sucesso! O doador receberá sua candidatura. E se você for selecionado, ele entrará em contato por e-mail.'
                        });

                        setFormAbertoId(null);
                        setComprovantes(prev => {
                          const novo = {...prev};
                          delete novo[animal.id];
                          return novo;
                        });
                        setTermosGerados(prev => {
                          const novo = {...prev};
                          delete novo[animal.id];
                          return novo;
                        });
                        setUserData(prev => ({
                          ...prev,
                          cpf: ''
                        }));

                        await loadAnimaisDisponiveis();

                      } catch (error) {
                        console.error('Erro ao enviar candidatura:', error);
                        setAlertConfig({
                          visible: true,
                          title: 'Erro',
                          message: 'Não foi possível enviar a candidatura. Tente novamente.'
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={!comprovantes[animal.id] || !termosGerados[animal.id] || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={[
                        styles.textoBotaoEnviar,
                        (!comprovantes[animal.id] || !termosGerados[animal.id]) && styles.textoBotaoEnviarDesabilitado
                      ]}>Enviar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
          ))}
        </ScrollView>
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  jaCandidatadoContainer: {
    marginTop: 15,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  jaCandidatadoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Adocao;
