# backend/Dockerfile

# 1. Imagem base leve do Python
FROM python:3.11-slim

# 2. Variáveis de ambiente para não gerar arquivos .pyc e evitar cache do pip
ENV PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# 3. Define o diretório de trabalho dentro do container
WORKDIR /app

# 4. Copia apenas o requirements.txt para aproveitar o cache do Docker
COPY requirements.txt .

# 5. Atualiza o pip e instala as dependências
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 6. Copia todo o restante do código da API para dentro do container
COPY . .

# 7. Expõe a porta que o Uvicorn irá usar
EXPOSE 8080

# 8. Comando padrão para iniciar a aplicação FastAPI via Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
