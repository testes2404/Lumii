// firebase-config.js
// Configuração centralizada do Firebase e outras APIs usando variáveis de ambiente

let config = null;

// Função para carregar configurações do backend
async function loadConfig() {
    if (config) {
        // Using cached config
        return config;
    }
    
    try {
        // Loading config from backend
        const response = await fetch('/api/config');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        config = await response.json();
        // Config loaded successfully
        
        return config;
    } catch (error) {
        // Error loading configuration
        
        // Não use fallback hardcoded em produção - é inseguro
        throw new Error('Configuração não encontrada. Verifique as variáveis de ambiente no Render.');
    }
}

// Função específica para Firebase (compatibilidade)
async function loadFirebaseConfig() {
    const fullConfig = await loadConfig();
    
    if (!fullConfig.firebase || !fullConfig.firebase.apiKey || fullConfig.firebase.apiKey === 'null') {
        throw new Error('Firebase API Key inválida ou não configurada');
    }
    
    return fullConfig.firebase;
}

// Função para carregar Gemini API key
async function loadGeminiApiKey() {
    const fullConfig = await loadConfig();
    
    if (!fullConfig.gemini || !fullConfig.gemini.apiKey) {
        throw new Error('Gemini API Key não configurada');
    }
    
    return fullConfig.gemini.apiKey;
}

// Exporta as funções para uso em outros arquivos
window.loadConfig = loadConfig;
window.loadFirebaseConfig = loadFirebaseConfig;
window.loadGeminiApiKey = loadGeminiApiKey;