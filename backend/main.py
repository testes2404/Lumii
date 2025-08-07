# backend/main.py

import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from pydantic import BaseModel

from google.cloud import aiplatform

# 1) Carrega variáveis de ambiente de um arquivo .env (GCP_PROJECT, GCP_REGION, etc.)
load_dotenv()

# 2) Inicializa o Vertex AI (AI Platform) com seu projeto e região
aiplatform.init(
    project=os.getenv("GCP_PROJECT"),
    location=os.getenv("GCP_REGION"),
)

# 3) Cria a instância do FastAPI
app = FastAPI()

# 4) Configura CORS para permitir chamadas ao /api a partir de seu front-end
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # ou especifique algo como ["https://seu-domínio.com"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# 5) Modelo de request para a rota /api/ask
class AskRequest(BaseModel):
    prompt: str

# 6) Rota de health check (para verificar se o serviço está vivo)
@app.get("/api/health")
def health():
    return {"status": "ok"}

# 6.1) Rota para fornecer configurações do Firebase para o frontend
@app.get("/api/config")
def get_config():
    # Debug: verificar se as variáveis estão sendo carregadas
    firebase_config = {
        "apiKey": os.getenv("FIREBASE_API_KEY", "AIzaSyDjys-U4aBy5SMXTasOp_TsfqziuqnEc9o"),
        "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN", "mini-genio-c204d.firebaseapp.com"),
        "projectId": os.getenv("FIREBASE_PROJECT_ID", "mini-genio-c204d"),
        "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET", "mini-genio-c204d.firebasestorage.app"),
        "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID", "553494129644"),
        "appId": os.getenv("FIREBASE_APP_ID", "1:553494129644:web:cc6f0de9d013392fc4eec9"),
        "measurementId": os.getenv("FIREBASE_MEASUREMENT_ID", "G-9WH6Z7XKK")
    }
    
    # Log para debug (removir em produção)
    print("🔥 Firebase Config:", {k: v[:10] + "..." if v and len(v) > 10 else v for k, v in firebase_config.items()})
    
    return {
        "firebase": firebase_config,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# 7) Rota que chama o modelo Gemini (Text Generation) no Vertex AI
@app.post("/api/ask")
def ask(request: AskRequest):
    try:
        model = aiplatform.TextGenerationModel.from_pretrained("text-bison@001")
        response = model.predict(
            request.prompt,
            max_output_tokens=256,
            temperature=0.7,
        )
        return {"answer": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 8) Rotas específicas para SPA do candidato
@app.get("/candidato")
async def serve_candidato_redirect():
    """Serve a página de redirecionamento para /candidato"""
    return FileResponse("static/candidato.html")

@app.get("/candidato/perfil")
async def serve_candidato_perfil():
    """Serve redirecionamento para /candidato/perfil"""
    return FileResponse("static/candidato/perfil/index.html")

@app.get("/candidato/vagas")
async def serve_candidato_vagas():
    """Serve redirecionamento para /candidato/vagas"""
    return FileResponse("static/candidato/vagas/index.html")

@app.get("/candidato/estudos")
async def serve_candidato_estudos():
    """Serve redirecionamento para /candidato/estudos"""
    return FileResponse("static/candidato/estudos/index.html")

@app.get("/candidato/desenvolvimento")
async def serve_candidato_desenvolvimento():
    """Serve redirecionamento para /candidato/desenvolvimento"""
    return FileResponse("static/candidato/desenvolvimento/index.html")

@app.get("/candidato/curriculo")
async def serve_candidato_curriculo():
    """Serve redirecionamento para /candidato/curriculo"""
    return FileResponse("static/candidato/curriculo/index.html")

# 9) Monta arquivos estáticos normalmente
app.mount(
    path="/",
    app=StaticFiles(directory="static", html=True),
    name="static",
)

# 9) Para executar o servidor diretamente
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    uvicorn.run(app, host=host, port=port)
