import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth, db } from '../configs/firebase_config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';

const MeusAnimais = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [meusAnimais, setMeusAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [animalToEdit, setAnimalToEdit] = useState(null);
  const [newName, setNewName] = useState('');
  const [updating, setUpdating] = useState(false);
  const [candidatoModalVisible, setCandidatoModalVisible] = useState(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);
  const [animalDoContexto, setAnimalDoContexto] = useState(null);
  const [imagemModalVisible, setImagemModalVisible] = useState(false);
  const [termoModalVisible, setTermoModalVisible] = useState(false);
  const [termoConteudo, setTermoConteudo] = useState('');
  
  const statusFilters = ['Todos', 'Disponível', 'Adotado'];

  useEffect(() => {
    loadAnimais();
  }, []);

  const loadAnimais = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      const animaisRef = collection(db, 'animais');
      const q = query(
        animaisRef, 
        where('doadorId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const animaisData = [];
      
      querySnapshot.forEach((doc) => {
        animaisData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      animaisData.sort((a, b) => {
        const dateA = a.criadoEm?.toDate?.() || new Date(0);
        const dateB = b.criadoEm?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setMeusAnimais(animaisData);
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      Alert.alert('Erro', 'Não foi possível carregar os animais.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimals = selectedFilter === 'Todos' 
    ? meusAnimais 
    : meusAnimais.filter(animal => animal.status === selectedFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Disponível':
        return '#4CAF50';
      case 'Em Processo':
        return '#FFA726';
      case 'Adotado':
        return '#9E9E9E';
      default:
        return '#999';
    }
  };

  const handleEditPress = (animal) => {
    setAnimalToEdit(animal);
    setNewName(animal.nome);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!newName.trim()) {
      Alert.alert('Aviso', 'Por favor, digite um nome para o animal.');
      return;
    }

    try {
      setUpdating(true);
      const animalRef = doc(db, 'animais', animalToEdit.id);
      await updateDoc(animalRef, {
        nome: newName.trim()
      });

      setMeusAnimais(prevAnimais =>
        prevAnimais.map(animal =>
          animal.id === animalToEdit.id
            ? { ...animal, nome: newName.trim() }
            : animal
        )
      );

      Alert.alert('Sucesso', 'Nome do animal atualizado!');
      setEditModalVisible(false);
    } catch (error) {
      console.error('Erro ao atualizar animal:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o nome do animal.');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewCandidato = (candidato, animal) => {
    setCandidatoSelecionado(candidato);
    setAnimalDoContexto(animal);
    setCandidatoModalVisible(true);
  };

  const handleViewComprovante = () => {
    setImagemModalVisible(true);
  };

  
  const handleViewTermo = async () => {
    try {
      if (candidatoSelecionado?.termoUrl) {
        const response = await fetch(candidatoSelecionado.termoUrl);
        const texto = await response.text();
        setTermoConteudo(texto);
        setTermoModalVisible(true);
      }
    } catch (error) {
      console.error('Erro ao carregar termo:', error);
      Alert.alert('Erro', 'Não foi possível carregar o termo.');
    }
  };

  const handleContactEmail = (email) => {
    const subject = encodeURIComponent('Contato sobre adoção de animal');
    const body = encodeURIComponent(`Olá ${candidatoSelecionado?.nome},\n\nGostaria de conversar sobre sua candidatura para adoção.\n\nAtenciosamente,`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
    
    if (typeof window !== 'undefined') {
      const gmailWindow = window.open(gmailUrl, '_blank');
      
      setTimeout(() => {
        if (!gmailWindow || gmailWindow.closed) {
          window.location.href = mailtoUrl;
        }
      }, 500);
    }
  };

  const handleDefinirAdotante = async () => {
    console.log('🔥 handleDefinirAdotante chamado!');
    console.log('Candidato:', candidatoSelecionado);
    console.log('Animal:', animalDoContexto);

    if (!candidatoSelecionado || !animalDoContexto) {
      console.log('❌ Faltam informações');
      if (Platform.OS === 'web') {
        window.alert('Erro: Informações do candidato ou animal não encontradas.');
      } else {
        Alert.alert('Erro', 'Informações do candidato ou animal não encontradas.');
      }
      return;
    }

    console.log('✅ Mostrando confirmação');

    const processarAdocao = async () => {
      console.log('✅ Usuário confirmou!');
      try {
        setUpdating(true);
        console.log('🔄 Atualizando no Firebase...');
        
        const animalRef = doc(db, 'animais', animalDoContexto.id);
        
        await updateDoc(animalRef, {
          status: 'Adotado',
          candidatos: [{
            ...candidatoSelecionado,
            adotadoEm: new Date().toISOString()
          }]
        });

        console.log('✅ Firebase atualizado!');

        setMeusAnimais(prevAnimais =>
          prevAnimais.map(animal =>
            animal.id === animalDoContexto.id
              ? {
                  ...animal,
                  status: 'Adotado',
                  candidatos: [{
                    ...candidatoSelecionado,
                    adotadoEm: new Date().toISOString()
                  }]
                }
              : animal
          )
        );

        console.log('✅ Lista local atualizada!');

        if (Platform.OS === 'web') {
          window.alert(`Sucesso! ${candidatoSelecionado.nome} foi definido como adotante de ${animalDoContexto.nome}!`);
        } else {
          Alert.alert(
            'Sucesso!',
            `${candidatoSelecionado.nome} foi definido como adotante de ${animalDoContexto.nome}!`
          );
        }
        
        setCandidatoModalVisible(false);
        setUpdating(false);
        console.log('✅ Processo completo!');
      } catch (error) {
        console.error('❌ Erro ao definir adotante:', error);
        if (Platform.OS === 'web') {
          window.alert('Erro: Não foi possível definir o adotante. Tente novamente.');
        } else {
          Alert.alert('Erro', 'Não foi possível definir o adotante. Tente novamente.');
        }
        setUpdating(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmado = window.confirm(
        `Confirma ${candidatoSelecionado.nome} como adotante de ${animalDoContexto.nome}?\n\nEsta ação irá:\n• Mudar o status do animal para "Adotado"\n• Remover os outros candidatos\n• Manter apenas este adotante`
      );
      if (confirmado) {
        await processarAdocao();
      } else {
        console.log('❌ Usuário cancelou');
      }
    } else {
      Alert.alert(
        'Confirmar Adoção',
        `Confirma ${candidatoSelecionado.nome} como adotante de ${animalDoContexto.nome}?\n\nEsta ação irá:\n• Mudar o status do animal para "Adotado"\n• Remover os outros candidatos\n• Manter apenas este adotante`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('❌ Usuário cancelou')
          },
          {
            text: 'Confirmar',
            onPress: processarAdocao
          }
        ]
      );
    }
  };

  const handleDelete = async (animal) => {
    const confirmarExclusao = async () => {
      try {
        setUpdating(true);
        const animalRef = doc(db, 'animais', animal.id);
        await deleteDoc(animalRef);

        setMeusAnimais(prevAnimais =>
          prevAnimais.filter(a => a.id !== animal.id)
        );

        if (Platform.OS === 'web') {
          window.alert('Sucesso! Animal excluído com sucesso!');
        } else {
          Alert.alert('Sucesso', 'Animal excluído com sucesso!');
        }
        setUpdating(false);
      } catch (error) {
        console.error('Erro ao excluir animal:', error);
        if (Platform.OS === 'web') {
          window.alert('Erro: Não foi possível excluir o animal. Tente novamente.');
        } else {
          Alert.alert('Erro', 'Não foi possível excluir o animal.');
        }
        setUpdating(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmado = window.confirm(
        `Tem certeza que deseja excluir ${animal.nome}? Esta ação não pode ser desfeita.`
      );
      if (confirmado) {
        await confirmarExclusao();
      }
    } else {
      Alert.alert(
        'Confirmar Exclusão',
        `Tem certeza que deseja excluir ${animal.nome}? Esta ação não pode ser desfeita.`,
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: confirmarExclusao
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Nome do Animal</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nome do animal"
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEditModalVisible(false)}
                disabled={updating}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton, updating && styles.btnDisabled]}
                onPress={handleSaveEdit}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalSaveText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={candidatoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCandidatoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.candidatoModalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.candidatoModalTitle}>Detalhes do Candidato</Text>
              
              <View style={styles.candidatoDetailSection}>
                <Icon name="person-circle-outline" size={60} color="#4e2096" style={styles.candidatoIcon} />
                
                <View style={styles.candidatoDetailRow}>
                  <Icon name="person-outline" size={20} color="#4e2096" />
                  <View style={styles.candidatoDetailText}>
                    <Text style={styles.candidatoDetailLabel}>Nome:</Text>
                    <Text style={styles.candidatoDetailValue}>{candidatoSelecionado?.nome}</Text>
                  </View>
                </View>

                <View style={styles.candidatoDetailRow}>
                  <Icon name="mail-outline" size={20} color="#4e2096" />
                  <View style={styles.candidatoDetailText}>
                    <Text style={styles.candidatoDetailLabel}>Email:</Text>
                    <Text style={styles.candidatoDetailValue}>{candidatoSelecionado?.email}</Text>
                  </View>
                </View>

                <View style={styles.candidatoDetailRow}>
                  <Icon name="card-outline" size={20} color="#4e2096" />
                  <View style={styles.candidatoDetailText}>
                    <Text style={styles.candidatoDetailLabel}>CPF:</Text>
                    <Text style={styles.candidatoDetailValue}>{candidatoSelecionado?.cpf}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.documentosSection}>
                <Text style={styles.documentosTitle}>Documentos Enviados</Text>
                
                <View style={styles.documentoCard}>
                  <View style={styles.documentoHeader}>
                    <Icon name="home-outline" size={24} color="#4e2096" />
                    <Text style={styles.documentoTitulo}>Comprovante de Residência</Text>
                  </View>
                  {candidatoSelecionado?.comprovanteUrl ? (
                    <TouchableOpacity 
                      style={styles.documentoButton}
                      onPress={handleViewComprovante}
                    >
                      <Icon name="eye-outline" size={18} color="white" />
                      <Text style={styles.documentoButtonText}>Visualizar Imagem</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.documentoIndisponivel}>Não disponível</Text>
                  )}
                </View>

                <View style={styles.documentoCard}>
                  <View style={styles.documentoHeader}>
                    <Icon name="document-text-outline" size={24} color="#4e2096" />
                    <Text style={styles.documentoTitulo}>Termo de Responsabilidade</Text>
                  </View>
                  {candidatoSelecionado?.termoUrl ? (
                    <TouchableOpacity 
                      style={styles.documentoButton}
                      onPress={handleViewTermo}
                    >
                      <Icon name="eye-outline" size={18} color="white" />
                      <Text style={styles.documentoButtonText}>Visualizar Termo</Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.documentoIndisponivel}>Não disponível</Text>
                  )}
                </View>
              </View>

              <View style={styles.candidatoActionsSection}>
                <TouchableOpacity 
                  style={styles.emailButton}
                  onPress={() => handleContactEmail(candidatoSelecionado?.email)}
                >
                  <Icon name="mail-outline" size={20} color="white" />
                  <Text style={styles.emailButtonText}>Enviar Email</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.definirAdotanteButton, updating && styles.btnDisabled]}
                  onPress={handleDefinirAdotante}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Icon name="checkmark-circle-outline" size={20} color="white" />
                      <Text style={styles.definirAdotanteButtonText}>Definir como Adotante</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setCandidatoModalVisible(false)}
            >
              <Text style={styles.closeModalText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={imagemModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImagemModalVisible(false)}
      >
        <View style={styles.imagemModalOverlay}>
          <View style={styles.imagemModalContent}>
            <View style={styles.imagemModalHeader}>
              <Text style={styles.imagemModalTitle}>Comprovante de Residência</Text>
              <TouchableOpacity onPress={() => setImagemModalVisible(false)}>
                <Icon name="close-outline" size={28} color="#4e2096" />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.imagemScrollView}
              contentContainerStyle={styles.imagemScrollContent}
              maximumZoomScale={3}
              minimumZoomScale={1}
            >
              {candidatoSelecionado?.comprovanteUrl && (
                <Image
                  source={{ uri: candidatoSelecionado.comprovanteUrl }}
                  style={styles.comprovanteImage}
                  resizeMode="contain"
                />
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeImageButton}
              onPress={() => setImagemModalVisible(false)}
            >
              <Text style={styles.closeImageButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={termoModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTermoModalVisible(false)}
      >
        <View style={styles.termoModalOverlay}>
          <View style={styles.termoModalContent}>
            <View style={styles.termoModalHeader}>
              <Text style={styles.termoModalTitle}>Termo de Responsabilidade</Text>
              <TouchableOpacity onPress={() => setTermoModalVisible(false)}>
                <Icon name="close-outline" size={28} color="white" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.termoScrollView}>
              <Text style={styles.termoTexto} selectable>
                {termoConteudo}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeTermoButton}
              onPress={() => setTermoModalVisible(false)}
            >
              <Text style={styles.closeTermoButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipSelected
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextSelected
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4e2096" />
          <Text style={styles.loadingText}>Carregando animais...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.subtitle}>
            Gerencie os animais que você colocou para adoção
          </Text>

          {filteredAnimals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="paw-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {selectedFilter === 'Todos' 
                  ? 'Você ainda não cadastrou nenhum animal'
                  : `Nenhum animal com status "${selectedFilter}"`
                }
              </Text>
            </View>
          ) : (
            filteredAnimals.map((animal) => (
            <View key={animal.id} style={styles.animalCard}>
              <View style={styles.animalHeader}>
                <Image 
                  source={{ uri: animal.fotoUrl }} 
                  style={styles.animalPhoto}
                />
                <View style={styles.animalInfo}>
                  <Text style={styles.animalName}>{animal.nome}</Text>
                  <Text style={styles.animalType}>{animal.tipo}</Text>
                  <View style={styles.statusContainer}>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { backgroundColor: getStatusColor(animal.status) }
                      ]}
                    >
                      <Text style={styles.statusText}>{animal.status}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditPress(animal)}
                  >
                    <Icon name="create-outline" size={24} color="#4e2096" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDelete(animal)}
                  >
                    <Icon name="trash-outline" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Área de candidatos */}
              <View style={styles.candidatosSection}>
                <View style={styles.candidatosHeader}>
                  <Icon name={animal.status === 'Adotado' ? 'checkmark-circle' : 'people-outline'} size={18} color={animal.status === 'Adotado' ? '#4CAF50' : '#4e2096'} />
                  <Text style={styles.candidatosTitle}>
                    {animal.status === 'Adotado' ? 'Adotante' : `Candidatos (${animal.candidatos?.length || 0})`}
                  </Text>
                </View>
                
                {(!animal.candidatos || animal.candidatos.length === 0) ? (
                  <Text style={styles.noCandidatosText}>
                    Nenhum candidato ainda
                  </Text>
                ) : (
                  <View style={styles.candidatosList}>
                    {animal.candidatos.map((candidato, index) => (
                      <View key={index} style={[styles.candidatoItem, animal.status === 'Adotado' && styles.adotanteItem]}>
                        <Icon name={animal.status === 'Adotado' ? 'checkmark-circle' : 'person-circle-outline'} size={32} color={animal.status === 'Adotado' ? '#4CAF50' : '#4e2096'} />
                        <View style={styles.candidatoInfo}>
                          <Text style={styles.candidatoNome}>
                            {candidato.nome}
                            {animal.status === 'Adotado' && ' ✓'}
                          </Text>
                          <Text style={styles.candidatoEmail}>{candidato.email}</Text>
                          {candidato.adotadoEm && (
                            <Text style={styles.adotadoEmText}>
                              Adotado em: {new Date(candidato.adotadoEm).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity 
                          style={[styles.viewCandidatoButton, animal.status === 'Adotado' && styles.viewAdotanteButton]}
                          onPress={() => handleViewCandidato(candidato, animal)}
                        >
                          <Text style={styles.viewCandidatoText}>Ver</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  filterChipSelected: {
    backgroundColor: '#4e2096',
    borderColor: '#4e2096',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextSelected: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fea740',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    textAlign: 'center',
  },
  animalCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#4e2096',
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  animalPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  animalInfo: {
    flex: 1,
    marginLeft: 15,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e2096',
    marginBottom: 4,
  },
  animalType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  candidatosSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  candidatosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  candidatosTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4e2096',
  },
  noCandidatosText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    paddingLeft: 24,
  },
  candidatosList: {
    gap: 10,
  },
  candidatoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  candidatoInfo: {
    flex: 1,
  },
  candidatoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  candidatoEmail: {
    fontSize: 12,
    color: '#666',
  },
  viewCandidatoButton: {
    backgroundColor: '#4e2096',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewCandidatoText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  adotanteItem: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  adotadoEmText: {
    fontSize: 11,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  viewAdotanteButton: {
    backgroundColor: '#4CAF50',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4e2096',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#E0E0E0',
  },
  modalSaveButton: {
    backgroundColor: '#4e2096',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  candidatoModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  candidatoModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4e2096',
    marginBottom: 25,
    textAlign: 'center',
  },
  candidatoDetailSection: {
    marginBottom: 25,
  },
  candidatoIcon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  candidatoDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  candidatoDetailText: {
    flex: 1,
  },
  candidatoDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  candidatoDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  documentosSection: {
    marginBottom: 25,
  },
  documentosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e2096',
    marginBottom: 15,
  },
  documentoCard: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  documentoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  documentoTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  documentoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4e2096',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  documentoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  documentoIndisponivel: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  candidatoActionsSection: {
    gap: 12,
    marginBottom: 20,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  emailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  definirAdotanteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 10,
  },
  definirAdotanteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeModalButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeModalText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  imagemModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagemModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '95%',
    maxWidth: 800,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  imagemModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  imagemModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e2096',
  },
  imagemScrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  imagemScrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  comprovanteImage: {
    width: '100%',
    height: 600,
    borderRadius: 10,
  },
  closeImageButton: {
    backgroundColor: '#4e2096',
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  closeImageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  termoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termoModalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '95%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  termoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4e2096',
  },
  termoModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  termoScrollView: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  termoTexto: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  closeTermoButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  closeTermoButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MeusAnimais;
