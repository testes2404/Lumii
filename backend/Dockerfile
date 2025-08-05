# 1. Imagem base leve do Python
FROM python:3.11-slim

# 2. Variáveis de ambiente para não gerar arquivos .pyc e pip sem cache
ENV PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# 3. Diretório de trabalho dentro do container
WORKDIR /app

# 4. Copia apenas o requirements.txt primeiro para aproveitar o cache do Docker
COPY requirements.txt .

# 5. Instala as dependências
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# 6. Copia todo o resto do código da sua API
COPY . .

# 7. Expõe a porta que o Uvicorn irá usar (Render injeta $PORT, mas aqui fixamos 8080)
EXPOSE 8080

# 8. Comando default para rodar a sua app FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
