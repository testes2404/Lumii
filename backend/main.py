# backend/main.py

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import aiplatform
from pydantic import BaseModel
from dotenv import load_dotenv

# Carrega variáveis do .env
load_dotenv()

# Inicializa o Vertex AI
aiplatform.init(
    project=os.getenv("GCP_PROJECT"),
    location=os.getenv("GCP_REGION")
)

app = FastAPI(title="Lumii Gemini API")

# Permite chamadas só do seu front hospedado
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.lumiiminigenios.com.br"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    prompt: str

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
