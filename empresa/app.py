from flask import Flask, jsonify
from datetime import datetime
import random # Para simular dados variados

# Cria a aplicação Flask
app = Flask(__name__)

# Função para simular a busca de dados no banco de dados
def buscar_dados_reais():
    """
    Esta função simularia consultas a um banco de dados real.
    SELECT COUNT(*) FROM candidaturas;
    SELECT status, COUNT(*) FROM candidaturas GROUP BY status;
    etc.
    Para este exemplo, vamos gerar dados aleatórios.
    """
    meses = ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul']
    candidaturas_por_mes = [random.randint(50, 300) for _ in meses]
    
    fontes = {
        'labels': ['LinkedIn', 'Indeed', 'Site da Empresa', 'Indicação'],
        'data': [random.randint(100, 500), random.randint(100, 400), random.randint(50, 250), random.randint(20, 100)]
    }
    
    # Métricas dos cards
    total_candidaturas = sum(candidaturas_por_mes)
    vagas_abertas = 12 # Poderia vir de 'SELECT COUNT(*) FROM vagas WHERE status="aberta"'
    contratados_30_dias = random.randint(5, 15)
    
    return {
        "kpis": {
            "total_candidaturas": total_candidaturas,
            "vagas_abertas": vagas_abertas,
            "contratados_30_dias": contratados_30_dias,
            "taxa_conversao": round((contratados_30_dias / total_candidaturas) * 100) if total_candidaturas > 0 else 0
        },
        "candidaturas_mensais": {
            "labels": meses,
            "data": candidaturas_por_mes
        },
        "origem_candidatos": fontes
    }


# Cria a rota da API em /api/metricas
@app.route('/api/metricas')
def get_metricas():
    dados = buscar_dados_reais()
    # Retorna os dados no formato JSON
    return jsonify(dados)

# Para rodar o servidor, você executaria este arquivo Python
if __name__ == '__main__':
    # 'host="0.0.0.0"' permite que a API seja acessível na sua rede local
    app.run(host="0.0.0.0", port=5000, debug=True)