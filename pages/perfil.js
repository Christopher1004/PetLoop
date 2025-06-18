import React from 'react';
import {StyleSheet,View,Text,TouchableOpacity,} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Or 

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Seu Perfil</Text>

      <View style={styles.profileCard}>
        <Icon
          name="account-circle"
          size={40}
          color={'#4e2096'}
          style={styles.profileIcon}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Amarildo Costa</Text>
          <Text style={styles.profileEmail}>amarildocosta@gmail.com</Text>
        </View>
        <TouchableOpacity onPress={() => console.log('Edit Profile')}>
          <Icon name="pencil" size={20} color={'#4e2096'} />
        </TouchableOpacity>
      </View>

      <View style={styles.navigationSection}>
        <TouchableOpacity
          style={styles.navigationItem}
          onPress={() => console.log('Go to Your Aid Pet')}>
          <Text style={styles.navigationItemText}>Seu Pet de Auxílio</Text>
          <Icon name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navigationItem}
          onPress={() => console.log('Go to Your Trainings')}>
          <Text style={styles.navigationItemText}>Seus Treinamentos</Text>
          <Icon name="chevron-right" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.premiumButton}
        onPress={() => console.log('Go to Premium Version')}>
        <Text style={styles.premiumButtonText}>Versão Premium</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightBackground',
    alignItems: 'center',
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fea740', 
    marginBottom: 30,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: '90%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  profileIcon: {
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e2096',
  },
  profileEmail: {
    fontSize: 14,
    color: 'lightGray',
  },
  navigationSection: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 40,
  },
  navigationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  navigationItemText: {
    fontSize: 16,
    color: 'lightGray',
  },
  premiumButton: {
    backgroundColor: '#fea740',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  premiumButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
