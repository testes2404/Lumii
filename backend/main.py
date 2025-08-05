import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google.cloud import aiplatform

# Carrega variáveis de .env (GCP_PROJECT, GCP_REGION, etc)
load_dotenv()

# Inicializa o AI Platform com seu projeto e região
project_id = os.getenv("GCP_PROJECT")
region = os.getenv("GCP_REGION")
aiplatform.init(project=project_id, location=region)

app = FastAPI()

# --- CORS (se precisar expor a API a partir de navegadores) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # ou especifique seus domínios
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Monta conteúdo estático (seu front-end) ---
# Tudo em backend/static será servido na raiz "/"
app.mount("/", StaticFiles(directory="static", html=True), name="static")


# --- Modelos de dados ---
class AskRequest(BaseModel):
    prompt: str


# --- Rotas da API ---
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask")
def ask(request: AskRequest):
    try:
        # Carrega o modelo Gemini (text-bison)
        model = aiplatform.TextGenerationModel.from_pretrained("text-bison@001")
        response = model.predict(
            request.prompt,
            max_output_tokens=256,
            temperature=0.7,
        )
        return {"answer": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
