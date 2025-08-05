# backend/Dockerfile

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# 1) Copia apenas o requirements específico do backend
COPY requirements.txt .

# 2) Atualiza o pip e instala tudo o que você precisa,
#    incluindo fastapi, uvicorn e google-cloud-aiplatform
RUN pip install --upgrade pip \
 && pip install --no-cache-dir fastapi uvicorn[standard] google-cloud-aiplatform python-dotenv \
 && pip install --no-cache-dir -r requirements.txt

# 3) Copia o resto da aplicação
COPY . .

# 4) Expõe a porta em que o Render irá encaminhar o tráfego
EXPOSE 8080

# 5) Comando de inicialização (usando o uvicorn que acabamos de instalar)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
