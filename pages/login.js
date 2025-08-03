import { useState } from 'react';
import {StyleSheet,Text,View,TextInput,TouchableOpacity,Image,} from 'react-native';
import {auth} from './../configs/firebase_config';
import { signInWithEmailAndPassword } from 'firebase/auth';
const TelaLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const fazerLogin = async() => {
    try{
      await signInWithEmailAndPassword(auth, email, senha)
      navigation.navigate('Drawer')
    }
    catch(error){
      alert('Erro ao fazer login: ' + error.message)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.parteSuperior}>
        <Image
          source={require('../assets/PetLoopLogo.jpg')}
          style={{ width: 250, height: 100 }}
        />
      </View>
      <View style={styles.parteCentral}>
        <Text style={styles.titulo}>Bem Vindo de Volta!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
        <View style={styles.embaixoInput}>
          <Text style={styles.Cadastre_se}>Lembrar de mim</Text>
          <Text style={styles.Cadastre_se}>Esqueceu sua senha?</Text>
        </View>
      </View>
      <View style={styles.parteInferior}>
        <TouchableOpacity
          style={styles.botao}
          onPress={fazerLogin}>
          <Text style={styles.textoBotao}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Cadastro')}>
            Não tem conta? <Text style={styles.Cadastre_se}> Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Cadastre_se: {
    color: '#4e2096',
  },
  parteSuperior: {
    alignItems: 'center',
    marginBottom: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  parteCentral: {
    alignContent: 'left',
  },
  parteInferior: {
    marginTop: 80,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fea740',
  },
  input: {
    height: 50,
    borderColor: '#4e2096',
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    color: 'black',
  },
  botao: {
    backgroundColor: '#4e2096',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    width: '50%',
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: 'gray',
  },
  embaixoInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
});

export default TelaLogin;
