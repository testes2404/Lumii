// firebase-config.js
// Configuração centralizada do Firebase usando variáveis de ambiente

let firebaseConfig = null;

// Função para carregar configurações do backend
async function loadFirebaseConfig() {
    if (firebaseConfig) return firebaseConfig;
    
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        firebaseConfig = config.firebase;
        return firebaseConfig;
    } catch (error) {
        console.error('Erro ao carregar configurações do Firebase:', error);
        // Fallback para configuração hardcoded (remover em produção)
        firebaseConfig = {
            apiKey: "AIzaSyDjys-U4aBy5SMXTasOp_TsfqziuqnEc9o",
            authDomain: "mini-genio-c204d.firebaseapp.com",
            projectId: "mini-genio-c204d",
            storageBucket: "mini-genio-c204d.firebasestorage.app",
            messagingSenderId: "553494129644",
            appId: "1:553494129644:web:cc6f0de9d013392fc4eec9",
            measurementId: "G-9WH6Z7XKK"
        };
        return firebaseConfig;
    }
}

// Exporta a função para uso em outros arquivos
window.loadFirebaseConfig = loadFirebaseConfig;