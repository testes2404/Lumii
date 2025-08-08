// firebase-config.js
// Configuração centralizada do Firebase usando variáveis de ambiente

let firebaseConfig = null;

// Função para carregar configurações do backend
async function loadFirebaseConfig() {
    if (firebaseConfig) {
        // Using cached Firebase config
        return firebaseConfig;
    }
    
    try {
        // Loading Firebase config from backend
        const response = await fetch('/api/config');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const config = await response.json();
        // Firebase config loaded successfully
        
        firebaseConfig = config.firebase;
        
        // Validar se a API key é válida
        if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'null') {
            throw new Error('Firebase API Key inválida ou não configurada');
        }
        
        return firebaseConfig;
    } catch (error) {
        // Error loading Firebase configuration
        
        // Não use fallback hardcoded em produção - é inseguro
        throw new Error('Firebase não configurado. Verifique as variáveis de ambiente no Render.');
    }
}

// Exporta a função para uso em outros arquivos
window.loadFirebaseConfig = loadFirebaseConfig;