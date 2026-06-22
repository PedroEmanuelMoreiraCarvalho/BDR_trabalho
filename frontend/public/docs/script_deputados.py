# Pegue os dados dos deputados pela API https://dadosabertos.camara.leg.br/api/v2/deputados
import requests
import pandas as pd
import json
from time import sleep
import os

# Configurações
api_path = "dadosabertos.camara.leg.br/api/v2/"

url_deputados_57 = f"{api_path}deputados?idLegislatura=57&ordem=ASC&ordenarPor=nome"

try:
    response = requests.get(url_deputados_57)
    if response.status_code == 200:
        deputados_57 = response.json()
        deputados_data = deputados_57.get('dados', [])

        if deputados_data:
            df = pd.DataFrame(deputados_data)
            df.to_csv('deputados_57.csv', index=False, encoding='utf-8')
            print(f"CSV file saved with {len(df)} deputies")

            # ===== REQUISIÇÕES PARA DADOS COMPLETOS DE CADA DEPUTADO =====
            ids_deputados = set(df['id'])
            print(f"\nTotal de IDs únicos: {len(ids_deputados)}")

            # Função para buscar dados de um deputado pela API
            def buscar_deputado_api(id_deputado, api_path):
                """
                Busca informações de um deputado pela API
                """
                url = f"https://{api_path}deputados/{id_deputado}"
                try:
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()
                    data = response.json()
                    return data.get("dados")
                except Exception as e:
                    print(f"Erro ao buscar deputado {id_deputado}: {e}")
                    return None

            # Buscar dados de todos os deputados
            print(f"Buscando dados completos de {len(ids_deputados)} deputados...")
            deputados_dados = []

            for idx, id_dep in enumerate(ids_deputados, 1):
                dados = buscar_deputado_api(id_dep, api_path)
                if dados:
                    deputados_dados.append(dados)
                    if idx % 10 == 0:
                        print(f"  Processados: {idx}/{len(ids_deputados)}")
                sleep(0.1)  # Pequeno delay para não sobrecarregar a API

            print(f"Total de deputados recuperados: {len(deputados_dados)}")

            # Converter para DataFrame, tratando dados aninhados
            deputados_api_full = pd.json_normalize(deputados_dados)

            # Salvar em CSV
            output_file = f'deputados_completo_api_legis57.csv'
            deputados_api_full.to_csv(output_file, index=False, encoding='utf-8', sep=';')
            print(f"✓ Dados salvos em: {output_file}")
        else:
            print("No data found")
except requests.RequestException as e:
    print(f"Error fetching deputados data: {e}")

