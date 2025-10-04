import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../configs/firebase_config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

const AUTH_KEY = '@PetLoop:auth';
const REMEMBER_ME_KEY = '@PetLoop:rememberMe';

export const authService = {
    // Fazer login e salvar credenciais se "lembrar de mim" estiver ativo
    login: async (email, password, rememberMe) => {
        try {
            console.log('=== Início do Processo de Login ===');
            console.log('Dados recebidos:', {
                temEmail: email ? 'Sim' : 'Não',
                temSenha: password ? 'Sim' : 'Não',
                lembrarDeMim: rememberMe ? 'Sim' : 'Não'
            });
            
            // Validação básica do email
            if (!email || !email.includes('@')) {
                throw new Error('Email inválido');
            }

            // Validação básica da senha
            if (!password || password.length < 6) {
                throw new Error('Senha inválida');
            }

            // Limpa email e garante que não há espaços
            const cleanEmail = email.trim().toLowerCase();
            
            console.log('Tentando login no Firebase...');
            const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
            console.log('Login no Firebase bem-sucedido!');
            
            if (rememberMe) {
                console.log('Salvando credenciais no AsyncStorage...');
                const credentialsToSave = {
                    email: cleanEmail,
                    password: password
                };
                
                // Primeiro, limpa qualquer credencial antiga
                await authService.clearSavedCredentials();
                
                // Depois salva as novas credenciais
                await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(credentialsToSave));
                await AsyncStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(true));
                
                // Verifica se as credenciais foram salvas
                const savedCredentials = await authService.getSavedCredentials();
                const savedRememberMe = await authService.isRememberMeActive();
                
                console.log('Verificação do salvamento:', {
                    credenciaisSalvas: savedCredentials ? 'Sim' : 'Não',
                    lembrarDeMimSalvo: savedRememberMe ? 'Sim' : 'Não',
                    emailSalvo: savedCredentials?.email || 'Nenhum'
                });

                if (!savedCredentials || !savedRememberMe) {
                    console.error('Falha ao salvar credenciais!');
                }
            } else {
                console.log('Lembrar de mim desativado, limpando credenciais...');
                await authService.clearSavedCredentials();
            }
            
            console.log('=== Fim do Processo de Login ===');
            return userCredential;
        } catch (error) {
            console.error('Erro no processo de login:', error);
            await authService.clearSavedCredentials();
            throw error;
        }
    },

    // Verificar se existem credenciais salvas
    getSavedCredentials: async () => {
        try {
            console.log('Verificando credenciais salvas...');
            const authData = await AsyncStorage.getItem(AUTH_KEY);
            const rememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);

            console.log('Dados encontrados no AsyncStorage:', {
                temAuthData: authData ? 'Sim' : 'Não',
                temRememberMe: rememberMe ? 'Sim' : 'Não'
            });

            if (authData && rememberMe === 'true') {
                const credentials = JSON.parse(authData);
                console.log('Credenciais parseadas:', {
                    temEmail: credentials.email ? 'Sim' : 'Não',
                    temSenha: credentials.password ? 'Sim' : 'Não'
                });

                // Validação básica do email
                if (!credentials.email || !credentials.email.includes('@')) {
                    console.error('Email inválido nas credenciais salvas');
                    await authService.clearSavedCredentials();
                    return null;
                }

                return credentials;
            }
            return null;
        } catch (error) {
            console.error('Erro ao recuperar credenciais:', error);
            await authService.clearSavedCredentials();
            return null;
        }
    },

    // Limpar credenciais salvas
    clearSavedCredentials: async () => {
        try {
            console.log('Limpando todas as credenciais salvas...');
            await AsyncStorage.removeItem(AUTH_KEY);
            await AsyncStorage.removeItem(REMEMBER_ME_KEY);
            console.log('Credenciais limpas com sucesso');
        } catch (error) {
            console.error('Erro ao limpar credenciais:', error);
        }
    },

    // Verificar se "lembrar de mim" está ativo
    isRememberMeActive: async () => {
        try {
            console.log('Verificando estado do Lembrar de Mim...');
            const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
            const isActive = value === 'true';
            console.log('Estado do Lembrar de Mim:', isActive ? 'Ativo' : 'Inativo');
            return isActive;
        } catch (error) {
            console.error('Erro ao verificar lembrar de mim:', error);
            return false;
        }
    },

    // Fazer logout e limpar credenciais
    logout: async () => {
        try {
            console.log('=== Início do Processo de Logout ===');
            
            try {
                // Primeiro faz logout no Firebase
                await signOut(auth);
                console.log('Logout do Firebase realizado com sucesso');
            } catch (firebaseError) {
                console.error('Erro ao fazer logout do Firebase:', firebaseError);
            }
            
            try {
                // Depois limpa as credenciais independentemente do resultado do Firebase
                await authService.clearSavedCredentials();
                console.log('Credenciais locais limpas com sucesso');
            } catch (storageError) {
                console.error('Erro ao limpar credenciais:', storageError);
            }
            
            console.log('=== Fim do Processo de Logout ===');
        } catch (error) {
            console.error('Erro durante o processo de logout:', error);
            throw error;
        }
    }
};