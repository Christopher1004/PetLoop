import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const TelaContato = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ajuda ou Contato</Text>

      <Text style={styles.sectionTitle}>Perguntas frequentes</Text>
      <View style={styles.faqSection}>
        <TouchableOpacity
          style={styles.faqItem}>
          <Text style={styles.faqItemText}>O que são animais de auxílio?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.faqItem}>
          <Text style={styles.faqItemText}>Como funciona a adoção?</Text>
        </TouchableOpacity>
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
