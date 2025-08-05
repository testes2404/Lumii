# backend/main.py

import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# 8) Monta seus arquivos estáticos (HTML/CSS/JS) em backend/static na raiz "/"
#    html=True faz com que GET "/" sirva o index.html automaticamente.
app.mount(
    path="/",
    app=StaticFiles(directory="static", html=True),
    name="static",
)
