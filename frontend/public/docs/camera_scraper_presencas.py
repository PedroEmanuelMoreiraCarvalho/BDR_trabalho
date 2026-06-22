import csv
import json
import os
import random
import re
import time
import requests
from bs4 import BeautifulSoup

# Configurações de URL e Headers
BASE_PROFILE_URL = "https://www.camara.leg.br/deputados/{id_deputado}?ano={ano}"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
    "Referer": "https://www.camara.leg.br/",
}

CSV_FILE = "presencas_resumo.csv"
IDS_JSON_FILE = "ids_deputados.json"

def fetch_html_profile(session: requests.Session, id_deputado: int, ano: int, tentativas: int = 3) -> str:
    """Faz a requisição HTTP da página de perfil do deputado usando a sessão persistente com retry automático."""
    url = BASE_PROFILE_URL.format(id_deputado=id_deputado, ano=ano)

    for tentativa in range(1, tentativas + 1):
        try:
            resp = session.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            return resp.text
        except requests.HTTPError as e:
            # Se for 404, significa que a página desse deputado/ano não existe (ex: não estava eleito nesse ano)
            if e.response.status_code == 404:
                raise FileNotFoundError(f"Página não encontrada (Deputado não ativo ou sem dados neste ano)")
            print(f"[Tentativa {tentativa}/{tentativas}] HTTP {e.response.status_code}: {url}")
            if tentativa < tentativas:
                time.sleep(2 * tentativa)
        except requests.RequestException as e:
            print(f"[Tentativa {tentativa}/{tentativas}] Erro de conexão: {e}")
            if tentativa < tentativas:
                time.sleep(2 * tentativa)
                
    raise RuntimeError(f"Falha de rede após {tentativas} tentativas")


def parse_resumo(html: str) -> dict:
    """Extrai os dados de presença/ausência de Plenário e Comissões do HTML."""
    soup = BeautifulSoup(html, "html.parser")
    
    # Estrutura padrão com valores zerados
    dados = {
        "plenario_presencas": 0,
        "plenario_ausencias_justificadas": 0,
        "plenario_ausencias_nao_justificadas": 0,
        "comissoes_presencas": 0,
        "comissoes_ausencias_justificadas": 0,
        "comissoes_ausencias_nao_justificadas": 0,
    }
    
    container = soup.find("div", class_="presencas__content")
    if not container:
        return dados
        
    sections = container.find_all("section", class_="presencas__section")
    for section in sections:
        # Pular seção de cabeçalho oculta
        if section.get("aria-hidden") == "true":
            continue
            
        heading_el = section.find(class_="presencas__section-heading")
        if not heading_el:
            continue
            
        heading_text = heading_el.get_text().strip().lower()
        
        # Identificar se é Plenário ou Comissões
        is_plenario = "plenário" in heading_text or "plenario" in heading_text
        is_comissoes = "comissões" in heading_text or "comissoes" in heading_text
        
        prefix = ""
        if is_plenario:
            prefix = "plenario_"
        elif is_comissoes:
            prefix = "comissoes_"
        else:
            continue
            
        # Iterar nos elementos da lista de dados
        items = section.find_all("li", class_="presencas__data")
        for item in items:
            label_el = item.find(class_="presencas__label")
            qtd_el = item.find(class_="presencas__qtd")
            
            if not label_el or not qtd_el:
                continue
                
            label = label_el.get_text().strip().lower()
            qtd_text = qtd_el.get_text().strip()
            
            # Extrair o valor numérico
            match = re.search(r"(\d+)", qtd_text)
            qtd = int(match.group(1)) if match else 0
            
            if "não justificadas" in label or "nao justificadas" in label:
                dados[f"{prefix}ausencias_nao_justificadas"] = qtd
            elif "justificadas" in label:
                dados[f"{prefix}ausencias_justificadas"] = qtd
            elif "presença" in label or "presenças" in label:
                dados[f"{prefix}presencas"] = qtd
                
    return dados


import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

csv_lock = threading.Lock()

def carregar_combinacoes_salvas(output_file: str) -> set:
    """Retorna um conjunto com tuplas (id_dep, ano) que já foram processadas e salvas com sucesso."""
    salvos = set()
    if not os.path.exists(output_file) or os.path.getsize(output_file) == 0:
        return salvos
        
    try:
        with open(output_file, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter=";")
            for row in reader:
                dep_id = row.get("id_dep")
                ano = row.get("ano_presenca")
                if dep_id and ano:
                    salvos.add((int(dep_id), int(ano)))
    except Exception as e:
        print(f"⚠️ Aviso ao carregar CSV existente: {e}")
        
    return salvos


def salvar_linha_csv(linha: dict, output_file: str = CSV_FILE):
    """Escreve uma única linha no arquivo CSV de forma progressiva (Append) para tolerância a quedas."""
    colunas = [
        "id_dep",
        "ano_presenca",
        "plenario_presencas",
        "plenario_ausencias_justificadas",
        "plenario_ausencias_nao_justificadas",
        "comissoes_presencas",
        "comissoes_ausencias_justificadas",
        "comissoes_ausencias_nao_justificadas"
    ]
    
    with csv_lock:
        file_exists = os.path.exists(output_file)
        if file_exists and os.path.getsize(output_file) == 0:
            file_exists = False
            
        with open(output_file, mode="a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=colunas, delimiter=";")
            if not file_exists:
                writer.writeheader()
            writer.writerow(linha)


def scrape_deputados(ids_deputados: list, anos: list, delay: float = 0.5, max_workers: int = 8) -> int:
    """Executa a raspagem de múltiplos anos para os deputados, salvando de forma progressiva e resiliente."""
    # 1. Carregar registros existentes para evitar re-scraping
    salvos = carregar_combinacoes_salvas(CSV_FILE)
    if salvos:
        print(f"ℹ️ Detectados {len(salvos)} registros já salvos em '{CSV_FILE}'. Eles serão preservados.")

    # 2. Criar fila de tarefas pendentes
    tarefas_pendentes = []
    for dep_id in ids_deputados:
        for ano in anos:
            if (int(dep_id), int(ano)) not in salvos:
                tarefas_pendentes.append((int(dep_id), int(ano)))
                
    total_pendente = len(tarefas_pendentes)
    if total_pendente == 0:
        print("🎉 Excelente! Todos os deputados e anos solicitados já foram processados.")
        return 0

    print(f"\n🚀 Iniciando raspagem concorrente para {total_pendente} tarefas pendentes com {max_workers} threads...")
    print("-" * 85)
    
    sucessos = 0
    erros = 0
    
    # Criar uma sessão por thread
    thread_local = threading.local()
    
    def get_session():
        if not hasattr(thread_local, "session"):
            thread_local.session = requests.Session()
            try:
                thread_local.session.get("https://www.camara.leg.br/", headers=HEADERS, timeout=10)
            except Exception:
                pass
        return thread_local.session

    def processar_tarefa(dep_id, ano):
        session = get_session()
        try:
            html = fetch_html_profile(session, dep_id, ano)
            resumo = parse_resumo(html)
            
            resumo["id_dep"] = dep_id
            resumo["ano_presenca"] = ano
            
            salvar_linha_csv(resumo, CSV_FILE)
            return True, dep_id, ano, resumo
        except FileNotFoundError:
            resumo_vazio = {
                "id_dep": dep_id,
                "ano_presenca": ano,
                "plenario_presencas": 0,
                "plenario_ausencias_justificadas": 0,
                "plenario_ausencias_nao_justificadas": 0,
                "comissoes_presencas": 0,
                "comissoes_ausencias_justificadas": 0,
                "comissoes_ausencias_nao_justificadas": 0,
            }
            salvar_linha_csv(resumo_vazio, CSV_FILE)
            return True, dep_id, ano, resumo_vazio
        except Exception as e:
            return False, dep_id, ano, str(e)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(processar_tarefa, dep_id, ano): (dep_id, ano) for dep_id, ano in tarefas_pendentes}
        
        for idx, future in enumerate(as_completed(futures), 1):
            ok, dep_id, ano, result = future.result()
            if ok:
                sucessos += 1
                print(
                    f"[{idx}/{total_pendente}] ID {dep_id:6} | Ano {ano} ... ✅ OK! "
                    f"(Plenário: P={result['plenario_presencas']}, AJ={result['plenario_ausencias_justificadas']} | "
                    f"Comissões: P={result['comissoes_presencas']}, AJ={result['comissoes_ausencias_justificadas']})"
                )
            else:
                erros += 1
                print(f"[{idx}/{total_pendente}] ID {dep_id:6} | Ano {ano} ... ❌ ERRO: {result}")
                
            if delay > 0:
                time.sleep(delay / max_workers)

    print("-" * 85)
    print("🎉 Processo de raspagem em lote finalizado!")
    print(f"📊 Resumo da execução:")
    print(f"   • Sucessos gravados: {sucessos}")
    print(f"   • Falhas ignoradas: {erros}")
    print(f"📂 Todos os dados consolidados estão salvos em: '{CSV_FILE}'")
    return sucessos


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Scraper de Resumo de Presença da Câmara dos Deputados (Múltiplos Anos & Resiliente)."
    )
    parser.add_argument(
        "--testar",
        action="store_true",
        help="Executar teste apenas com os primeiros 5 deputados da lista."
    )
    parser.add_argument(
        "--anos",
        type=int,
        nargs="+",
        default=[2026, 2025, 2024, 2023],
        help="Lista de anos a serem coletados (padrão: 2026 2025 2024 2023)."
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.5,
        help="Intervalo base em segundos entre as requisições (padrão: 0.5)."
    )
    parser.add_argument(
        "--todos",
        action="store_true",
        help="Executa para todos os IDs de deputados sem perguntar."
    )
    parser.add_argument(
        "--threads",
        type=int,
        default=8,
        help="Número de threads concorrentes para a raspagem (padrão: 8)."
    )

    args = parser.parse_args()

    # Verificar se temos o arquivo de IDs
    if not os.path.exists(IDS_JSON_FILE):
        print(f"Erro: '{IDS_JSON_FILE}' não encontrado. Por favor, execute o script 'extrair_ids.py' primeiro.")
        exit(1)
        
    with open(IDS_JSON_FILE, "r", encoding="utf-8") as f:
        ids_deputados = json.load(f)

    # Definir deputados a serem processados
    if args.testar or (not args.todos and len(ids_deputados) > 5):
        print(f"🔬 Modo de Teste: Executando apenas para os primeiros 5 deputados.")
        ids_para_rodar = ids_deputados[:5]
    else:
        ids_para_rodar = ids_deputados

    # Executar a raspagem resiliente para todos os anos solicitados
    scrape_deputados(ids_para_rodar, args.anos, args.delay, max_workers=args.threads)
