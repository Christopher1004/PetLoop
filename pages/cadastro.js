import { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
} from 'react-native';

const TelaCadastro = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    return (
        <View style={styles.container}>
            
            <Text style={styles.titulo}>Seja Bem-Vindo!</Text>

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

            <TouchableOpacity style={styles.botao}>
                <Text style={styles.textoBotao}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text style={styles.link} onPress={() => navigation.goBack()}>Já Possui Conta? Login</Text>
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
        color: 'white',
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
        color: '#8f33a4',
    },
});

export default TelaCadastro;