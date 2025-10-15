import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const TelaContato = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ajuda ou Contato</Text>

      <Text style={styles.sectionTitle}>Perguntas frequentes</Text>
      <View style={styles.faqSection}>
        {/* Pergunta 1 */}
        <View>
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => toggleFaq(1)}>
            <Text style={styles.faqItemText}>O que são animais de auxílio?</Text>
            <Icon 
              name={expandedFaq === 1 ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#4e2096" 
            />
          </TouchableOpacity>
          {expandedFaq === 1 && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>
                Animais de auxílio, também conhecidos como animais de assistência ou suporte emocional, 
                são pets especialmente treinados para ajudar pessoas com necessidades específicas. 
                Eles podem auxiliar em diversas situações, como:
              </Text>
              <Text style={styles.faqAnswerText}>
                • Cães-guia para pessoas com deficiência visual{'\n'}
                • Animais de suporte emocional para ansiedade e depressão{'\n'}
                • Cães de alerta médico para condições como diabetes ou epilepsia{'\n'}
                • Animais de terapia que ajudam na recuperação física e mental
              </Text>
              <Text style={styles.faqAnswerText}>
                No PetLoop, conectamos você com animais treinados e certificados para essas funções especiais.
              </Text>
            </View>
          )}
        </View>

        {/* Pergunta 2 */}
        <View>
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => toggleFaq(2)}>
            <Text style={styles.faqItemText}>Como funciona a adoção?</Text>
            <Icon 
              name={expandedFaq === 2 ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#4e2096" 
            />
          </TouchableOpacity>
          {expandedFaq === 2 && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>
                O processo de adoção no PetLoop é simples e seguro:
              </Text>
              <Text style={styles.faqAnswerText}>
                1. <Text style={styles.boldText}>Escolha o animal:</Text> Navegue pela tela de adoção e selecione o pet de sua escolha usando os filtros (Cães, Gatos, Cavalos ou Todos).{'\n\n'}
                2. <Text style={styles.boldText}>Envie comprovante de residência:</Text> Faça upload de um documento que comprove seu endereço atual.{'\n\n'}
                3. <Text style={styles.boldText}>Assine o termo de responsabilidade:</Text> Leia e aceite o termo de compromisso com o bem-estar do animal.{'\n\n'}
                4. <Text style={styles.boldText}>Aguarde o contato do doador:</Text> O responsável pelo animal entrará em contato para agendar uma visita e finalizar a adoção.
              </Text>
              <Text style={styles.faqAnswerText}>
                Todo o processo é acompanhado para garantir que o pet encontre um lar amoroso e responsável!
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Contato</Text>
      <View style={styles.contactSection}>
        <TouchableOpacity style={styles.contactItem}>
          <Text style={styles.contactText}>+55 (11) 00000-000</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactItem}>
          <Text style={styles.contactText}>petloop@gmail.com</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fea740',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e2096',
    alignSelf: 'flex-start', 
    marginLeft: '5%', 
    marginBottom: 15,
  },
  faqSection: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 30,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  faqItemText: {
    fontSize: 16,
    color: '#4e2096',
    fontWeight: '600',
    flex: 1,
  },
  faqAnswer: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#4e2096',
  },
  divider: {
    width: '90%',
    height: 1,
    backgroundColor: 'primaryPurple',
    marginBottom: 30,
  },
  contactSection: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10, 
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  
  contactText: {
    fontSize: 16,
    color: '#4e2096', 
  },
});

export default TelaContato;
