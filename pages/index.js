import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
} from 'react-native';

const TelaLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    return (
        <View style={styles.container}>
            <View style={styles.parteSuperior}>

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

            </View>
            <View style={styles.parteInferior}>
                <TouchableOpacity style={styles.botao}>
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
        color: '#4e2096'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    parteCentral: {
        alignContent: 'left'
    },
    parteInferior: {
        marginTop: 100,
        alignItems: 'center'
    },
    titulo: {
        fontSize: 28,
        marginBottom: 20,
        textAlign: 'center',
        color: '#fea740',
        textAlign: 'left'
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
        width: '50%'
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

export default TelaLogin;