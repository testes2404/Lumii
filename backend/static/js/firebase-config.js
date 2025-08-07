// firebase-config.js
// Configuração centralizada do Firebase usando variáveis de ambiente

let firebaseConfig = null;

// Função para carregar configurações do backend
async function loadFirebaseConfig() {
    if (firebaseConfig) {
        console.log('🔥 Usando config Firebase em cache');
        return firebaseConfig;
    }
    
    try {
        console.log('🔄 Carregando config Firebase do backend...');
        const response = await fetch('/api/config');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        console.log('✅ Config Firebase carregada do backend:', {
            environment: config.environment,
            hasApiKey: !!config.firebase?.apiKey,
            projectId: config.firebase?.projectId
        });
        
        firebaseConfig = config.firebase;
        
        // Validar se a API key é válida
        if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'null') {
            throw new Error('Firebase API Key inválida ou não configurada');
        }
        
        return firebaseConfig;
    } catch (error) {
        console.error('❌ Erro ao carregar configurações do Firebase:', error);
        console.log('🔄 Usando configuração de fallback...');
        
        // Fallback para configuração hardcoded (desenvolvimento)
        firebaseConfig = {
            apiKey: "AIzaSyDjys-U4aBy5SMXTasOp_TsfqziuqnEc9o",
            authDomain: "mini-genio-c204d.firebaseapp.com",
            projectId: "mini-genio-c204d",
            storageBucket: "mini-genio-c204d.firebasestorage.app",
            messagingSenderId: "553494129644",
            appId: "1:553494129644:web:cc6f0de9d013392fc4eec9",
            measurementId: "G-9WH6Z7XKK"
        };
        
        console.log('⚠️ Usando config de fallback');
        return firebaseConfig;
    }
}

// Exporta a função para uso em outros arquivos
window.loadFirebaseConfig = loadFirebaseConfig;