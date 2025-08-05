# backend/Dockerfile

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# <-- Certifique-se de que é exatamente "/app" aqui, não outro nome
WORKDIR /app

# Instala dependências de forma cacheável
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copia todo o código da API
COPY . .

# Informa que estaremos escutando na porta 8080
EXPOSE 8080

# Inicia o Uvicorn apontando para o módulo main:app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
