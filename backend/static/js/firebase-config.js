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
        console.error('🔒 Não é possível continuar sem as credenciais do Firebase configuradas no servidor');
        
        // Não use fallback hardcoded em produção - é inseguro
        throw new Error('Firebase não configurado. Verifique as variáveis de ambiente no Render.');
    }
}

// Exporta a função para uso em outros arquivos
window.loadFirebaseConfig = loadFirebaseConfig;