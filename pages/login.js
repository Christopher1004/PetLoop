import { useState, useEffect } from 'react';
import {StyleSheet,Text,View,TextInput,TouchableOpacity,Image} from 'react-native';
import Checkbox from 'expo-checkbox';
import { authService } from '../services/auth';
const TelaLogin = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Verifica se existem credenciais salvas ao carregar a tela
  useEffect(() => {
    const verificarCredenciais = async () => {
      try {
        console.log('Verificando credenciais na tela de login...');
        const credenciais = await authService.getSavedCredentials();
        const rememberMe = await authService.isRememberMeActive();
        
        console.log('Credenciais encontradas na tela de login:', credenciais ? 'Sim' : 'Não');
        console.log('RememberMe ativo na tela de login:', rememberMe ? 'Sim' : 'Não');
        
        if (credenciais && rememberMe) {
          setEmail(credenciais.email);
          setSenha(credenciais.password);
          setLembrarDeMim(true);
          
          // Tenta fazer login automático
          try {
            await fazerLogin(true);
          } catch (loginError) {
            console.error('Erro no login automático:', loginError);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar credenciais:', error);
      }
    };

    verificarCredenciais();
  }, []);

  const fazerLogin = async(isAutoLogin = false) => {
    try {
      console.log('Tentando fazer login...', isAutoLogin ? '(Automático)' : '(Manual)');
      console.log('Estado do lembrarDeMim:', lembrarDeMim);
      console.log('Email:', email);
      
      if (!email || !email.includes('@')) {
        throw new Error('Por favor, insira um email válido');
      }

      if (!senha || senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }
      
      await authService.login(email.trim(), senha, lembrarDeMim);
      console.log('Login bem-sucedido!');
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Drawer' }],
      });
    } catch(error) {
      console.error('Erro ao fazer login:', error);
      
      // Limpa as credenciais em caso de erro no login automático
      if (isAutoLogin) {
        await authService.clearSavedCredentials();
        setEmail('');
        setSenha('');
        setLembrarDeMim(false);
      } else {
        alert('Erro ao fazer login: ' + (error.message || 'Verifique suas credenciais'));
      }
    }
  }

  const [lembrarDeMim, setLembrarDeMim] = useState(false);

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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox
              value={lembrarDeMim}
              onValueChange={setLembrarDeMim}
              color={lembrarDeMim ? '#4e2096' : '#4e2096'}
            />
            <Text style={styles.Cadastre_se}>Lembrar de mim</Text>
          </View>
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
