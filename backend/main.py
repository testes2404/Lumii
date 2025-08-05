from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google.cloud import aiplatform
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()  # carrega variáveis GCP_PROJECT, GCP_REGION, etc.

# inicializa client do Vertex AI
aiplatform.init(
    project=os.getenv("GCP_PROJECT"),
    location=os.getenv("GCP_REGION"),
)

app = FastAPI()

# CORS (libera seu front chamando a API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1) Route da API em /api/…
class AskRequest(BaseModel):
    prompt: str

@app.get("/api/health")
def health():
    return {"status": "ok"}

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

# 2) Monta o static na raiz “/”
app.mount(
    "/", 
    StaticFiles(directory="static", html=True), 
    name="static"
)
