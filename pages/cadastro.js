import { useState } from 'react';
import {StyleSheet,Text,View,TextInput,TouchableOpacity,Image,} from 'react-native';
import {auth, db} from './../configs/firebase_config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
const TelaCadastro = ({ navigation }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const cadastrar = async() => {
    try{
      const userCred = await createUserWithEmailAndPassword(auth, email,senha);
      const uid = userCred.user.uid

      await setDoc(doc(db, 'usuarios', uid), {
        nome,
        email,
      })
      alert('Usuario criado com sucesso!')
      navigation.navigate('Entrar')
    }
    catch(error){
      alert('Erro: ' + error.message)
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
      <Text style={styles.titulo}>Seja Bem-Vindo!</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        keyboardType="default"
      />
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

      <TouchableOpacity onPress={cadastrar} style={styles.botao}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.link} onPress={() => navigation.goBack()}>
          Já Possui Conta? <Text style={styles.txtLogin}> Entre</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  txtLogin: {
    color: '#4e2096',
  },
  titulo: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fea740',
  },
  parteSuperior: {
    alignItems: 'center',
    marginBottom: 10
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
    backgroundColor: '#8f33a4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
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
});

export default TelaCadastro;
