# Lumii - Portal de Candidatos

Sistema completo de portal para candidatos com área administrativa para empresas, desenvolvido com FastAPI (backend) e JavaScript vanilla (frontend).

## 🚀 Funcionalidades

### Para Candidatos
- **Dashboard profissional** com acesso rápido
- **Gerenciamento de perfil** e criação de currículo
- **Busca e candidatura** a vagas
- **Materiais de estudo** e desenvolvimento
- **URLs profissionais** (`/candidato/perfil`, `/candidato/vagas`, etc.)
- **Onboarding interativo** para novos usuários

### Para Empresas
- **Publicação de vagas**
- **Gerenciamento de candidatos**
- **Relatórios e analytics**

## 🛠️ Tecnologias

- **Backend**: FastAPI (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Banco de dados**: Firebase Firestore
- **AI/ML**: Google Vertex AI (Gemini)
- **Autenticação**: Firebase Auth

## 📋 Pré-requisitos

- Python 3.8+
- Conta no Firebase
- Conta no Google Cloud Platform (para Vertex AI)

## ⚙️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd Lumii
```

### 2. Instale as dependências
```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure as variáveis de ambiente

#### Desenvolvimento
Crie um arquivo `.env` na pasta `backend/` com as seguintes variáveis:

```env
# Environment
ENVIRONMENT=development
DEBUG=true

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Cloud Platform
GCP_PROJECT=your-gcp-project-id
GCP_REGION=your-region
```

#### Produção
Para produção, use o template `.env.prod.template` como base:

```env
# Environment
ENVIRONMENT=production
DEBUG=false

# Domínios permitidos para CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Firebase Production (use credenciais de produção)
FIREBASE_API_KEY=your-production-firebase-api-key
# ... outras variáveis Firebase de produção

# Google Cloud Platform Production
GCP_PROJECT=your-production-gcp-project
GCP_REGION=us-central1

# Security
SECRET_KEY=your-32-character-secret-key-here
```

### 4. Configure o Firebase
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Firestore Database
3. Configure as regras de segurança
4. Obtenha as credenciais e adicione ao `.env`

### 5. Configure o Google Cloud Platform
1. Ative a Vertex AI API
2. Configure as credenciais (service account)
3. Adicione o projeto e região ao `.env`

## 🚀 Como Executar

### Desenvolvimento
```bash
cd backend
python main.py
```

O servidor estará disponível em: `http://127.0.0.1:8000`

### Com Uvicorn (alternativa)
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## 📁 Estrutura do Projeto

```
Lumii/
├── backend/
│   ├── static/                 # Frontend files
│   │   ├── candidato/         # Candidate portal
│   │   ├── empresa/           # Company portal  
│   │   ├── gerenciamento/     # Admin panel
│   │   └── js/                # Shared JavaScript
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (create this)
├── README.md
└── .gitignore
```

## 🌐 Rotas Principais

### Candidatos
- `/` - Página inicial
- `/candidato` - Dashboard do candidato
- `/candidato/perfil` - Gerenciamento de perfil
- `/candidato/vagas` - Lista de vagas disponíveis
- `/candidato/estudos` - Materiais de estudo
- `/candidato/desenvolvimento` - Área de desenvolvimento
- `/candidato/curriculo` - Visualizador de currículo

### API
- `/api/health` - Health check
- `/api/config` - Configurações do Firebase
- `/api/ask` - Integração com Gemini AI

## 🔧 Desenvolvimento

### SPA Routing
O sistema usa roteamento SPA (Single Page Application) com:
- **HTML5 History API** para URLs limpos
- **JavaScript Router** personalizado
- **Redirecionamento automático** para rotas dinâmicas

### Firebase Integration
- **Firestore** para banco de dados
- **Authentication** para login/registro
- **Security Rules** configuradas

## 🚀 Deploy e Produção

### Preparação para Produção

1. **Configure ambiente de produção:**
   ```bash
   cp .env.prod.template .env
   # Edite .env com credenciais reais de produção
   ```

2. **Instale dependências de produção:**
   ```bash
   pip install gunicorn
   ```

3. **Execute em produção:**
   ```bash
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

### Considerações de Segurança

- ✅ **HTTPS obrigatório** em produção
- ✅ **CORS configurado** apenas para domínios autorizados
- ✅ **Credenciais em variáveis de ambiente**
- ✅ **DEBUG=false** em produção
- ✅ **Firewall configurado** (apenas portas necessárias)
- ✅ **Service Account** do GCP com permissões mínimas

### Deploy Recomendado

**Docker:**
```dockerfile
FROM python:3.11-slim
COPY backend/ /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

**Cloud Platforms:**
- Google Cloud Run
- Heroku
- AWS Lambda
- Azure Container Instances