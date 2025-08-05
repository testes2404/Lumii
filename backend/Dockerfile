# backend/Dockerfile

FROM python:3.11-slim

# Evita geração de .pyc e cache do pip
ENV PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# Diretório de trabalho onde o seu código estará
WORKDIR /app

# Copia só o requirements para cache de dependências
COPY requirements.txt .

# Atualiza o pip e instala as libs
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copia todo o código da API para /app
COPY . .

# Expõe a porta que o Uvicorn vai usar
EXPOSE 8080

# Inicia o servidor FastAPI via Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
