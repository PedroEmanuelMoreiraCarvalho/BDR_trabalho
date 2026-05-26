import psycopg2
import csv
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datetime import datetime, date
import json
from datetime import datetime
import os

# Configurações
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'admin',
    'password': 'admin123'  # Ajuste sua senha
}

NOME_BANCO = 'meu_banco'

def salvar_metadados(metadados, nome_arquivo="metadados_carga.json"):
    """
    Salva os metadados da carga em um arquivo JSON
    
    Args:
        metadados (dict): Dicionário com os metadados
        nome_arquivo (str): Nome do arquivo de saída
    """
    # Adicionar timestamp final
    metadados['timestamp_final'] = datetime.now().isoformat()
    
    # Definir caminho do arquivo
    caminho_arquivo = f"logs/{nome_arquivo}"
    
    # Criar diretório logs se não existir
    os.makedirs("logs", exist_ok=True)
    
    # Carregar metadados existentes se o arquivo já existir
    historico = []
    if os.path.exists(caminho_arquivo):
        try:
            with open(caminho_arquivo, 'r', encoding='utf-8') as f:
                historico = json.load(f)
                if not isinstance(historico, list):
                    historico = [historico]
        except:
            historico = []
    
    # Adicionar nova execução ao histórico
    historico.append(metadados)
    
    # Manter apenas as últimas 100 execuções
    if len(historico) > 100:
        historico = historico[-100:]
    
    # Salvar no arquivo
    with open(caminho_arquivo, 'w', encoding='utf-8') as f:
        json.dump(historico, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\n📄 Metadados salvos em: {caminho_arquivo}")
    return caminho_arquivo

def registrar_erro(arquivo_log, tabela, linha_numero, linha_conteudo, erro_mensagem):
    """
    Registra um erro em um arquivo de log específico da tabela
    
    Args:
        arquivo_log (str): Caminho do arquivo de log
        tabela (str): Nome da tabela
        linha_numero (int): Número da linha com erro
        linha_conteudo (list): Conteúdo da linha que gerou erro
        erro_mensagem (str): Mensagem de erro
    """
    # Criar diretório logs se não existir
    os.makedirs("logs/erros", exist_ok=True)
    
    # Definir caminho do arquivo de log
    caminho_log = f"logs/erros/{arquivo_log}"
    
    with open(caminho_log, 'a', encoding='utf-8') as f:
        f.write(f"{'='*80}\n")
        f.write(f"Timestamp: {datetime.now().isoformat()}\n")
        f.write(f"Tabela: {tabela}\n")
        f.write(f"Linha: {linha_numero}\n")
        f.write(f"Conteúdo da linha: {linha_conteudo}\n")
        f.write(f"Erro: {erro_mensagem}\n")
        f.write(f"{'='*80}\n\n")
    
    print(f"  ⚠️ Erro registrado em: {caminho_log}")

def criar_banco_se_nao_existe():
    """Cria o banco de dados se ele não existir"""
    try:
        # Conectar ao banco 'postgres' que sempre existe
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Verificar se o banco existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (NOME_BANCO,))
        existe = cursor.fetchone()
        
        if not existe:
            print(f"Criando banco de dados '{NOME_BANCO}'...")
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(NOME_BANCO)))
            print(f"Banco '{NOME_BANCO}' criado com sucesso!")
        else:
            print(f"Banco '{NOME_BANCO}' já existe.")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Erro ao criar banco: {e}")
        return False

def conversor_int_cpf(cpf_int):
    """Converte um CPF inteiro para string formatada (11 dígitos)"""
    try:
        cpf_str = str(int(cpf_int)).zfill(11)
        return cpf_str
    except Exception:
        return None

def carregar_deputados(caminho_arquivo):
    """
    Carrega dados de deputados de um arquivo CSV para o banco de dados com coleta de metadados
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'deputados',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_deputados_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM deputados")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS deputados (
                id_deputado INTEGER PRIMARY KEY,
                uri_deputado VARCHAR(255) NOT NULL,
                nome_civil_deputado VARCHAR(255) NOT NULL,
                cpf_deputado VARCHAR(11) NOT NULL,
                sexo_deputado VARCHAR(1) NOT NULL,
                rede_social_deputado TEXT,
                data_nascimento_deputado DATE,
                escolaridade_deputado VARCHAR(100),
                ultimo_status_sigla_partido VARCHAR(20),
                ultimo_status_sigla_uf VARCHAR(2),
                ultimo_status_url_foto VARCHAR(255),
                ultimo_status_nome_eleitoral VARCHAR(255) NOT NULL,
                ultimo_status_situacao VARCHAR(50),
                ultimo_status_condicao_eleitoral VARCHAR(50)
            )
        """)
        
        print("Tabela 'deputados' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    id_deputado = converter_para_int(linha[0] if len(linha) > 0 else None)
                    uri_deputado = linha[1].strip() if len(linha) > 1 else None
                    nome_civil_deputado = linha[2].strip() if len(linha) > 2 else None
                    cpf_deputado = linha[3].strip() if len(linha) > 3 else None
                    sexo_deputado = linha[4].strip() if len(linha) > 4 else None
                    
                    # Converter rede social
                    rede_social = linha[5].strip() if len(linha) > 5 and linha[5] else None
                    if rede_social and rede_social.startswith('['):
                        itens = rede_social.strip('[]').replace("'", "").replace('"', '').split(',')
                        rede_social = ';'.join([item.strip() for item in itens])
                    
                    data_nascimento_deputado = converter_para_date(linha[6] if len(linha) > 6 else None)
                    escolaridade_deputado = linha[7].strip() if len(linha) > 7 and linha[7] else None
                    ultimo_status_sigla_partido = linha[8].strip() if len(linha) > 8 and linha[8] else None
                    ultimo_status_sigla_uf = linha[9].strip() if len(linha) > 9 and linha[9] else None
                    ultimo_status_url_foto = linha[10].strip() if len(linha) > 10 and linha[10] else None
                    ultimo_status_nome_eleitoral = linha[11].strip() if len(linha) > 11 else None
                    ultimo_status_situacao = linha[12].strip() if len(linha) > 12 and linha[12] else None
                    ultimo_status_condicao_eleitoral = linha[13].strip() if len(linha) > 13 and linha[13] else None
                    
                    if not id_deputado:
                        erro_msg = "ID do deputado é obrigatório"
                        registrar_erro(arquivo_log, 'deputados', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    try:
                        cursor.execute("""
                            INSERT INTO deputados (
                                id_deputado, uri_deputado, nome_civil_deputado, cpf_deputado,
                                sexo_deputado, rede_social_deputado, data_nascimento_deputado,
                                escolaridade_deputado, ultimo_status_sigla_partido,
                                ultimo_status_sigla_uf, ultimo_status_url_foto,
                                ultimo_status_nome_eleitoral, ultimo_status_situacao,
                                ultimo_status_condicao_eleitoral
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id_deputado) DO UPDATE SET
                                uri_deputado = EXCLUDED.uri_deputado,
                                nome_civil_deputado = EXCLUDED.nome_civil_deputado,
                                cpf_deputado = EXCLUDED.cpf_deputado,
                                sexo_deputado = EXCLUDED.sexo_deputado,
                                rede_social_deputado = EXCLUDED.rede_social_deputado,
                                data_nascimento_deputado = EXCLUDED.data_nascimento_deputado,
                                escolaridade_deputado = EXCLUDED.escolaridade_deputado,
                                ultimo_status_sigla_partido = EXCLUDED.ultimo_status_sigla_partido,
                                ultimo_status_sigla_uf = EXCLUDED.ultimo_status_sigla_uf,
                                ultimo_status_url_foto = EXCLUDED.ultimo_status_url_foto,
                                ultimo_status_nome_eleitoral = EXCLUDED.ultimo_status_nome_eleitoral,
                                ultimo_status_situacao = EXCLUDED.ultimo_status_situacao,
                                ultimo_status_condicao_eleitoral = EXCLUDED.ultimo_status_condicao_eleitoral
                        """, (
                            id_deputado, uri_deputado, nome_civil_deputado, cpf_deputado,
                            sexo_deputado, rede_social, data_nascimento_deputado,
                            escolaridade_deputado, ultimo_status_sigla_partido,
                            ultimo_status_sigla_uf, ultimo_status_url_foto,
                            ultimo_status_nome_eleitoral, ultimo_status_situacao,
                            ultimo_status_condicao_eleitoral
                        ))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'deputados', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'deputados', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM deputados")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_deputados.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def converter_para_int(valor):
    """Converte valor para inteiro, tratando diferentes formatos"""
    if not valor or valor.strip() == '':
        return None
    
    valor = str(valor).strip()
    
    # Tratar valores com ponto decimal (ex: '1.0')
    if '.' in valor:
        try:
            return int(float(valor))
        except:
            return None
    
    # Tratar valores normais
    try:
        return int(valor)
    except:
        return None

def converter_para_boolean(valor):
    """Converte valor para booleano"""
    if not valor or valor.strip() == '':
        return None
    
    valor = str(valor).strip().lower()
    
    if valor in ['true', '1', '1.0' ,'sim', 'yes', 'verdadeiro', 'verdade']:
        return True
    elif valor in ['false', '0', '0.0', 'nao', 'não', 'no', 'falso']:
        return False
    
    return None

def converter_para_timestamp(valor):
    """Converte diferentes formatos de data/hora para timestamp"""
    if not valor or valor.strip() == '':
        return None
    
    valor = str(valor).strip()
    
    # Tenta diferentes formatos
    formatos = [
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%dT%H:%M:%S',
        '%Y-%m-%d %H:%M:%S.%f',
        '%Y-%m-%dT%H:%M:%S.%f',
        '%Y-%m-%d'
    ]
    
    from datetime import datetime
    for formato in formatos:
        try:
            return datetime.strptime(valor, formato)
        except:
            continue
    
    # Se nenhum formato funcionar, retorna None
    print(f"  Aviso: não foi possível converter timestamp: {valor}")
    return None

def converter_para_date(valor):
    """Converte valor para date"""
    if not valor or valor.strip() == '':
        return None
    
    valor = str(valor).strip()
    
    # Remove o timestamp se existir
    if 'T' in valor:
        valor = valor.split('T')[0]
    elif ' ' in valor:
        valor = valor.split(' ')[0]
    
    try:
        from datetime import datetime
        return datetime.strptime(valor, '%Y-%m-%d').date()
    except:
        return None

def carregar_votacao(caminho_arquivo):
    """
    Carrega dados de votações de um arquivo CSV para o banco de dados com coleta de metadados
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'votacao',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_votacao_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM votacao")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS votacao (
                id_votacao VARCHAR(50) PRIMARY KEY,
                data_votacao DATE NOT NULL,
                data_hora_registro_votacao TIMESTAMP,
                id_evento INTEGER NOT NULL,
                aprovacao BOOLEAN,
                votos_sim INTEGER NOT NULL,
                votos_nao INTEGER NOT NULL,
                votos_outros INTEGER NOT NULL,
                descricao_votacao TEXT,
                ultima_abertura_votacao_data_hora_registro TIMESTAMP,
                ultima_abertura_votacao_descricao TEXT,
                ultima_apresentacao_proposicao_data_hora_registro TIMESTAMP,
                ultima_apresentacao_proposicao_descricao TEXT,
                id_proposicao INTEGER
            )
        """)
        
        print("Tabela 'votacao' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    id_votacao = linha[0].strip() if len(linha) > 0 else None
                    data_votacao = converter_para_date(linha[1] if len(linha) > 1 else None)
                    data_hora_registro_votacao = converter_para_timestamp(linha[2] if len(linha) > 2 else None)
                    id_evento = converter_para_int(linha[3] if len(linha) > 3 else None)
                    aprovacao = converter_para_boolean(linha[5] if len(linha) > 5 else None)
                    votos_sim = converter_para_int(linha[6] if len(linha) > 6 else None) or 0
                    votos_nao = converter_para_int(linha[7] if len(linha) > 7 else None) or 0
                    votos_outros = converter_para_int(linha[8] if len(linha) > 8 else None) or 0
                    descricao_votacao = linha[9].strip() if len(linha) > 9 and linha[9] else None
                    ultima_abertura_data_hora = converter_para_timestamp(linha[10] if len(linha) > 10 else None)
                    ultima_abertura_descricao = linha[11].strip() if len(linha) > 11 and linha[11] else None
                    ultima_apresentacao_data_hora = converter_para_timestamp(linha[12] if len(linha) > 12 else None)
                    ultima_apresentacao_descricao = linha[13].strip() if len(linha) > 13 and linha[13] else None
                    id_proposicao = converter_para_int(linha[14] if len(linha) > 14 else None)
                    
                    if not id_votacao or not data_votacao:
                        erro_msg = "Dados obrigatórios faltando: id_votacao, data_votacao"
                        registrar_erro(arquivo_log, 'votacao', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    if  (not id_evento and not id_proposicao):
                        erro_msg = "Dados obrigatórios faltando: id_evento e id_proposicao"
                        registrar_erro(arquivo_log, 'votacao', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue

                    try:
                        cursor.execute("""
                            INSERT INTO votacao (
                                id_votacao, data_votacao, data_hora_registro_votacao,
                                id_evento, aprovacao, votos_sim, votos_nao, votos_outros,
                                descricao_votacao, ultima_abertura_votacao_data_hora_registro,
                                ultima_abertura_votacao_descricao, ultima_apresentacao_proposicao_data_hora_registro,
                                ultima_apresentacao_proposicao_descricao, id_proposicao
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id_votacao) DO UPDATE SET
                                data_votacao = EXCLUDED.data_votacao,
                                data_hora_registro_votacao = EXCLUDED.data_hora_registro_votacao,
                                id_evento = EXCLUDED.id_evento,
                                aprovacao = EXCLUDED.aprovacao,
                                votos_sim = EXCLUDED.votos_sim,
                                votos_nao = EXCLUDED.votos_nao,
                                votos_outros = EXCLUDED.votos_outros,
                                descricao_votacao = EXCLUDED.descricao_votacao,
                                ultima_abertura_votacao_data_hora_registro = EXCLUDED.ultima_abertura_votacao_data_hora_registro,
                                ultima_abertura_votacao_descricao = EXCLUDED.ultima_abertura_votacao_descricao,
                                ultima_apresentacao_proposicao_data_hora_registro = EXCLUDED.ultima_apresentacao_proposicao_data_hora_registro,
                                ultima_apresentacao_proposicao_descricao = EXCLUDED.ultima_apresentacao_proposicao_descricao,
                                id_proposicao = EXCLUDED.id_proposicao
                        """, (
                            id_votacao, data_votacao, data_hora_registro_votacao,
                            id_evento, aprovacao, votos_sim, votos_nao, votos_outros,
                            descricao_votacao, ultima_abertura_data_hora,
                            ultima_abertura_descricao, ultima_apresentacao_data_hora,
                            ultima_apresentacao_descricao, id_proposicao
                        ))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'votacao', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'votacao', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM votacao")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_votacao.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def carregar_votacoes_orientacoes(caminho_arquivo):
    """
    Carrega dados de orientações de votações de um arquivo CSV para o banco de dados com coleta de metadados
    CSV esperado: id_votacao;partido;tipo;orientacao;prioridade
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'votacoes_orientacoes',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_votacoes_orientacoes_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM votacoes_orientacoes")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS votacoes_orientacoes (
                id_votacao VARCHAR(50) NOT NULL,
                sigla_bancada VARCHAR(50) NOT NULL,
                orientacao VARCHAR(50),
                tipo VARCHAR(50),
                prioridade INTEGER,
                PRIMARY KEY (id_votacao, sigla_bancada)
            )
        """)
        
        print("Tabela 'votacoes_orientacoes' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    # CSV: id_votacao;partido;tipo;orientacao;prioridade
                    # Índices: 0=id_votacao, 1=partido, 2=tipo, 3=orientacao, 4=prioridade
                    
                    id_votacao = linha[0].strip() if len(linha) > 0 else None
                    sigla_bancada = linha[1].strip() if len(linha) > 1 else None  # partido -> sigla_bancada
                    tipo = linha[2].strip() if len(linha) > 2 and linha[2] else None
                    orientacao = linha[3].strip() if len(linha) > 3 and linha[3] else None
                    prioridade = converter_para_int(linha[4] if len(linha) > 4 else None)
                    
                    if not id_votacao or not sigla_bancada:
                        erro_msg = "Dados obrigatórios faltando: id_votacao ou sigla_bancada"
                        registrar_erro(arquivo_log, 'votacoes_orientacoes', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    try:
                        cursor.execute("""
                            INSERT INTO votacoes_orientacoes (id_votacao, sigla_bancada, orientacao, tipo, prioridade)
                            VALUES (%s, %s, %s, %s, %s)
                            ON CONFLICT (id_votacao, sigla_bancada) DO UPDATE SET
                                orientacao = EXCLUDED.orientacao,
                                tipo = EXCLUDED.tipo,
                                prioridade = EXCLUDED.prioridade
                        """, (id_votacao, sigla_bancada, orientacao, tipo, prioridade))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'votacoes_orientacoes', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros (Inseridos: {inseridos}, Atualizados: {atualizados})...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'votacoes_orientacoes', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM votacoes_orientacoes")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_votacoes_orientacoes.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
            # Mostrar amostra dos dados
            cursor.execute("SELECT * FROM votacoes_orientacoes LIMIT 5")
            amostra = cursor.fetchall()
            if amostra:
                print("\nAmostra dos dados inseridos:")
                for row in amostra:
                    print(f"  Votação: {row[0]} | Bancada: {row[1]} | Orientação: {row[2]} | Tipo: {row[3]} | Prioridade: {row[4]}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def carregar_votacoes_votos(caminho_arquivo):
    """
    Carrega dados de votos dos deputados de um arquivo CSV para o banco de dados com coleta de metadados
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'votacoes_votos',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_votacoes_votos_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM votacoes_votos")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS votacoes_votos (
                id_votacao VARCHAR(50) NOT NULL,
                id_deputado INTEGER NOT NULL,
                voto VARCHAR(50) NOT NULL,
                deputado_sigla_partido VARCHAR(255),
                PRIMARY KEY (id_votacao, id_deputado)
            )
        """)
        
        print("Tabela 'votacoes_votos' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    id_votacao = linha[0].strip() if len(linha) > 0 else None
                    id_deputado = converter_para_int(linha[1] if len(linha) > 1 else None)
                    voto = linha[2].strip() if len(linha) > 2 and linha[2] else None
                    sigla_partido = linha[3].strip() if len(linha) > 3 and linha[3] else None
                    

                    if not id_votacao or not id_deputado or not voto:
                        erro_msg = "Dados obrigatórios faltando"
                        registrar_erro(arquivo_log, 'votacoes_votos', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    try:
                        cursor.execute("""
                            INSERT INTO votacoes_votos (id_votacao, id_deputado, voto, deputado_sigla_partido)
                            VALUES (%s, %s, %s, %s)
                            ON CONFLICT (id_votacao, id_deputado) DO UPDATE SET
                                voto = EXCLUDED.voto,
                                deputado_sigla_partido = EXCLUDED.deputado_sigla_partido
                        """, (id_votacao, id_deputado, voto, sigla_partido))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'votacoes_votos', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'votacoes_votos', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM votacoes_votos")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}",
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_votacoes_votos.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def carregar_despesas(caminho_arquivo):
    """
    Carrega dados de despesas dos deputados de um arquivo CSV para o banco de dados com coleta de metadados
    CSV esperado: id_cadastro_deputado;id_deputado;nome_parlamentar;cpf;sigla_partido;sigla_uf;nu_legislatura;cod_legislatura;cod_subcota;desc_subcota;cod_especificacao_subcota;desc_especificacao_subcota;fornecedor_nome;fornecedor_cnpj_cpf;data_emissao;mes;ano;valor_documento;valor_glosa;valor_liquido;id_documento;url_documento
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'despesas',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_despesas_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Remover constraints problemáticas
        print("Removendo constraints de validação...")
        cursor.execute("""
            ALTER TABLE despesas DROP CONSTRAINT IF EXISTS valor_documento_check;
            ALTER TABLE despesas DROP CONSTRAINT IF EXISTS valor_glosa_check;
            ALTER TABLE despesas DROP CONSTRAINT IF EXISTS valor_liquido_check;
        """)
        conn.commit()
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM despesas")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS despesas (
                id_cadastro_deputado INTEGER,
                id_deputado INTEGER,
                nome_parlamentar VARCHAR(255),
                cpf VARCHAR(11),
                sigla_partido VARCHAR(20),
                sigla_uf VARCHAR(2),
                nu_legislatura INTEGER,
                cod_legislatura INTEGER,
                cod_subcota INTEGER,
                desc_subcota VARCHAR(255),
                cod_especificacao_subcota INTEGER,
                desc_especificacao_subcota VARCHAR(255),
                fornecedor_nome VARCHAR(255),
                fornecedor_cnpj_cpf VARCHAR(14),
                data_emissao DATE,
                mes INTEGER,
                ano INTEGER,
                valor_documento DECIMAL(15,2),
                valor_glosa DECIMAL(15,2),
                valor_liquido DECIMAL(15,2),
                id_documento INTEGER,
                url_documento TEXT
            )
        """)
        
        print("Tabela 'despesas' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            erros = 0
            linhas_erro = []
            valores_negativos = 0
            
            print("Iniciando carga de dados...")
            
            # Função para converter valor decimal
            def converter_valor(valor_str):
                if not valor_str or valor_str.strip() == '':
                    return 0.0
                try:
                    return float(valor_str.replace(',', '.'))
                except:
                    return 0.0
            
            for linha in leitor_csv:
                try:
                    # CSV com 22 colunas (incluindo cpf)
                    id_cadastro_deputado = converter_para_int(linha[0] if len(linha) > 0 else None)
                    id_deputado = converter_para_int(linha[1] if len(linha) > 1 else None)
                    nome_parlamentar = linha[2].strip() if len(linha) > 2 and linha[2] else None
                    cpf = linha[3].strip() if len(linha) > 3 and linha[3] else None
                    
                    # Limpar CPF (remover pontuação)
                    if cpf:
                        cpf = ''.join(filter(str.isdigit, cpf))
                    cpf = cpf[11:] if cpf and len(cpf) == 11 else cpf

                    cpf = str(cpf[:11]).zfill(11) if cpf else None
                    
                    sigla_partido = linha[4].strip() if len(linha) > 4 and linha[4] else None
                    sigla_uf = linha[5].strip() if len(linha) > 5 and linha[5] else None
                    nu_legislatura = converter_para_int(linha[6] if len(linha) > 6 else None)
                    cod_legislatura = converter_para_int(linha[7] if len(linha) > 7 else None)
                    cod_subcota = converter_para_int(linha[8] if len(linha) > 8 else None)
                    desc_subcota = linha[9].strip() if len(linha) > 9 and linha[9] else None
                    cod_especificacao_subcota = converter_para_int(linha[10] if len(linha) > 10 else None)
                    desc_especificacao_subcota = linha[11].strip() if len(linha) > 11 and linha[11] else None
                    fornecedor_nome = linha[12].strip() if len(linha) > 12 and linha[12] else None
                    
                    # Limpar CNPJ/CPF do fornecedor
                    fornecedor_cnpj_cpf = linha[13].strip() if len(linha) > 13 and linha[13] else None
                    if fornecedor_cnpj_cpf:
                        fornecedor_cnpj_cpf = ''.join(filter(str.isdigit, fornecedor_cnpj_cpf))
                    
                    data_emissao = converter_para_date(linha[14] if len(linha) > 14 else None)
                    mes = converter_para_int(linha[15] if len(linha) > 15 else None)
                    ano = converter_para_int(linha[16] if len(linha) > 16 else None)
                    
                    valor_documento = converter_valor(linha[17] if len(linha) > 17 else None)
                    valor_glosa = converter_valor(linha[18] if len(linha) > 18 else None)
                    valor_liquido = converter_valor(linha[19] if len(linha) > 19 else None)
                    
                    # Contar valores negativos
                    if valor_documento < 0 or valor_liquido < 0:
                        valores_negativos += 1
                    
                    id_documento = converter_para_int(linha[20] if len(linha) > 20 else None)
                    url_documento = linha[21].strip() if len(linha) > 21 and linha[21] else None
                    
                    try:
                        cursor.execute("""
                            INSERT INTO despesas (
                                id_cadastro_deputado, id_deputado, nome_parlamentar, cpf,
                                sigla_partido, sigla_uf, nu_legislatura, cod_legislatura,
                                cod_subcota, desc_subcota, cod_especificacao_subcota, 
                                desc_especificacao_subcota, fornecedor_nome, fornecedor_cnpj_cpf,
                                data_emissao, mes, ano, valor_documento, valor_glosa, 
                                valor_liquido, id_documento, url_documento
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            id_cadastro_deputado, id_deputado, nome_parlamentar, cpf,
                            sigla_partido, sigla_uf, nu_legislatura, cod_legislatura,
                            cod_subcota, desc_subcota, cod_especificacao_subcota,
                            desc_especificacao_subcota, fornecedor_nome, fornecedor_cnpj_cpf,
                            data_emissao, mes, ano, valor_documento, valor_glosa,
                            valor_liquido, id_documento, url_documento
                        ))
                        
                        inseridos += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'despesas', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if inseridos % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos} registros...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'despesas', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM despesas")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'valores_negativos': valores_negativos,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_despesas.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Valores negativos encontrados: {valores_negativos}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
            # Mostrar amostra dos dados
            cursor.execute("SELECT id_deputado, nome_parlamentar, cpf, valor_liquido FROM despesas LIMIT 5")
            amostra = cursor.fetchall()
            if amostra:
                print("\nAmostra dos dados inseridos:")
                for row in amostra:
                    print(f"  Deputado: {row[0]} | Nome: {row[1]} | CPF: {row[2]} | Valor: R$ {row[3]}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def carregar_eventos(caminho_arquivo):
    """
    Carrega dados de eventos/sessões de um arquivo CSV para o banco de dados com coleta de metadados
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'eventos',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_eventos_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM eventos")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS eventos (
                id_evento INTEGER PRIMARY KEY,
                data_evento DATE,
                situacao_evento VARCHAR(50),
                tipo_evento VARCHAR(100),
                data_hora_inicio_evento TIMESTAMP,
                data_hora_fim_evento TIMESTAMP,
                descricao_evento TEXT,
                url_documento_pauta TEXT
            )
        """)
        
        print("Tabela 'eventos' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    id_evento = converter_para_int(linha[0] if len(linha) > 0 else None)
                    data_evento = converter_para_date(linha[1] if len(linha) > 1 else None)
                    situacao_evento = linha[2].strip() if len(linha) > 2 and linha[2] else None
                    tipo_evento = linha[3].strip() if len(linha) > 3 and linha[3] else None
                    data_hora_inicio_evento = converter_para_timestamp(linha[4] if len(linha) > 4 else None)
                    data_hora_fim_evento = converter_para_timestamp(linha[5] if len(linha) > 5 else None)
                    descricao_evento = linha[6].strip() if len(linha) > 6 and linha[6] else None
                    url_documento_pauta = linha[7].strip() if len(linha) > 7 and linha[7] else None
                    
                    if not id_evento:
                        erro_msg = "ID do evento é obrigatório"
                        registrar_erro(arquivo_log, 'eventos', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    try:
                        cursor.execute("""
                            INSERT INTO eventos (
                                id_evento, data_evento, situacao_evento, tipo_evento,
                                data_hora_inicio_evento, data_hora_fim_evento,
                                descricao_evento, url_documento_pauta
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id_evento) DO UPDATE SET
                                data_evento = EXCLUDED.data_evento,
                                situacao_evento = EXCLUDED.situacao_evento,
                                tipo_evento = EXCLUDED.tipo_evento,
                                data_hora_inicio_evento = EXCLUDED.data_hora_inicio_evento,
                                data_hora_fim_evento = EXCLUDED.data_hora_fim_evento,
                                descricao_evento = EXCLUDED.descricao_evento,
                                url_documento_pauta = EXCLUDED.url_documento_pauta
                        """, (
                            id_evento, data_evento, situacao_evento, tipo_evento,
                            data_hora_inicio_evento, data_hora_fim_evento,
                            descricao_evento, url_documento_pauta
                        ))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'eventos', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros (Inseridos: {inseridos}, Atualizados: {atualizados})...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'eventos', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM eventos")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_eventos.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
            # Mostrar os últimos 5 registros
            cursor.execute("""
                SELECT id_evento, data_evento, tipo_evento, situacao_evento
                FROM eventos 
                ORDER BY id_evento DESC 
                LIMIT 5
            """)
            
            print("\nÚltimos 5 eventos:")
            for row in cursor.fetchall():
                print(f"  ID: {row[0]} | Data: {row[1]} | Tipo: {row[2]} | Situação: {row[3]}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def carregar_presenca_deputados(caminho_arquivo):
    """
    Carrega dados de presença de deputados de um arquivo CSV para o banco de dados com coleta de metadados
    CSV esperado: id_dep;ano_presenca;plenario_presencas;plenario_ausencias_justificadas;plenario_ausencias_nao_justificadas;comissoes_presencas;comissoes_ausencias_justificadas;comissoes_ausencias_nao_justificadas
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'presenca_deputados',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_presenca_deputados_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM presenca_deputados")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS presenca_deputados (
                id_dep INTEGER NOT NULL,
                ano_presenca INTEGER,
                plenario_presencas INTEGER,
                plenario_ausencias_justificadas INTEGER,
                plenario_ausencias_nao_justificadas INTEGER,
                comissoes_presencas INTEGER,
                comissoes_ausencias_justificadas INTEGER,
                comissoes_ausencias_nao_justificadas INTEGER,
                PRIMARY KEY (id_dep, ano_presenca)
            )
        """)
        
        print("Tabela 'presenca_deputados' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    # CSV: id_dep;ano_presenca;plenario_presencas;plenario_ausencias_justificadas;
                    # plenario_ausencias_nao_justificadas;comissoes_presencas;comissoes_ausencias_justificadas;
                    # comissoes_ausencias_nao_justificadas
                    
                    id_dep = converter_para_int(linha[0] if len(linha) > 0 else None)
                    ano_presenca = converter_para_int(linha[1] if len(linha) > 1 else None)
                    plenario_presencas = converter_para_int(linha[2] if len(linha) > 2 else None) or 0
                    plenario_ausencias_justificadas = converter_para_int(linha[3] if len(linha) > 3 else None) or 0
                    plenario_ausencias_nao_justificadas = converter_para_int(linha[4] if len(linha) > 4 else None) or 0
                    comissoes_presencas = converter_para_int(linha[5] if len(linha) > 5 else None) or 0
                    comissoes_ausencias_justificadas = converter_para_int(linha[6] if len(linha) > 6 else None) or 0
                    comissoes_ausencias_nao_justificadas = converter_para_int(linha[7] if len(linha) > 7 else None) or 0
                    
                    if not id_dep or not ano_presenca:
                        erro_msg = "Dados obrigatórios faltando: id_dep ou ano_presenca"
                        registrar_erro(arquivo_log, 'presenca_deputados', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    try:
                        cursor.execute("""
                            INSERT INTO presenca_deputados (
                                id_dep, ano_presenca, plenario_presencas, 
                                plenario_ausencias_justificadas, plenario_ausencias_nao_justificadas,
                                comissoes_presencas, comissoes_ausencias_justificadas, 
                                comissoes_ausencias_nao_justificadas
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id_dep, ano_presenca) DO UPDATE SET
                                plenario_presencas = EXCLUDED.plenario_presencas,
                                plenario_ausencias_justificadas = EXCLUDED.plenario_ausencias_justificadas,
                                plenario_ausencias_nao_justificadas = EXCLUDED.plenario_ausencias_nao_justificadas,
                                comissoes_presencas = EXCLUDED.comissoes_presencas,
                                comissoes_ausencias_justificadas = EXCLUDED.comissoes_ausencias_justificadas,
                                comissoes_ausencias_nao_justificadas = EXCLUDED.comissoes_ausencias_nao_justificadas
                        """, (
                            id_dep, ano_presenca, plenario_presencas,
                            plenario_ausencias_justificadas, plenario_ausencias_nao_justificadas,
                            comissoes_presencas, comissoes_ausencias_justificadas,
                            comissoes_ausencias_nao_justificadas
                        ))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'presenca_deputados', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros (Inseridos: {inseridos}, Atualizados: {atualizados})...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'presenca_deputados', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM presenca_deputados")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_presenca_deputados.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
            # Mostrar amostra dos dados
            cursor.execute("SELECT id_dep, ano_presenca, plenario_presencas, comissoes_presencas FROM presenca_deputados LIMIT 5")
            amostra = cursor.fetchall()
            if amostra:
                print("\nAmostra dos dados inseridos:")
                for row in amostra:
                    print(f"  Deputado: {row[0]} | Ano: {row[1]} | Plenário Presenças: {row[2]} | Comissões Presenças: {row[3]}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def carregar_frentes_deputados(caminho_arquivo):
    """
    Carrega dados de participação de deputados em frentes parlamentares de um arquivo CSV para o banco de dados com coleta de metadados
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'frentes_deputados',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_frentes_deputados_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM frentes_deputados")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS frentes_deputados (
                id_frente INTEGER NOT NULL,
                titulo_frente TEXT,
                id_deputado INTEGER NOT NULL,
                data_inicio DATE,
                data_fim DATE,
                PRIMARY KEY (id_frente, id_deputado)
            )
        """)
        
        print("Tabela 'frentes_deputados' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    id_frente = converter_para_int(linha[0] if len(linha) > 0 else None)
                    titulo_frente = linha[1].strip() if len(linha) > 1 and linha[1] else None
                    id_deputado = converter_para_int(linha[2] if len(linha) > 2 else None)
                    data_inicio = converter_para_date(linha[3] if len(linha) > 3 else None)
                    data_fim = converter_para_date(linha[4] if len(linha) > 4 else None)
                    
                    if not id_frente or not id_deputado:
                        erro_msg = "Dados obrigatórios faltando: id_frente ou id_deputado"
                        registrar_erro(arquivo_log, 'frentes_deputados', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    try:
                        cursor.execute("""
                            INSERT INTO frentes_deputados (
                                id_frente, titulo_frente, id_deputado, data_inicio, data_fim
                            ) VALUES (%s, %s, %s, %s, %s)
                            ON CONFLICT (id_frente, id_deputado) DO UPDATE SET
                                titulo_frente = EXCLUDED.titulo_frente,
                                data_inicio = EXCLUDED.data_inicio,
                                data_fim = EXCLUDED.data_fim
                        """, (id_frente, titulo_frente, id_deputado, data_inicio, data_fim))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'frentes_deputados', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'frentes_deputados', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM frentes_deputados")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_frentes_deputados.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def carregar_proposicoes_autores(caminho_arquivo):
    """
    Carrega dados de autores de proposições de um arquivo CSV para o banco de dados com coleta de metadados
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'proposicoes_autores',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_proposicoes_autores_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM proposicoes_autores")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS proposicoes_autores (
                id_proposicao INTEGER NOT NULL,
                id_deputado INTEGER,
                cod_tipo_autor INTEGER,
                tipo_autor VARCHAR(50),
                ordem_assinatura INTEGER,
                proponente BOOLEAN
            )
        """)
        
        print("Tabela 'proposicoes_autores' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    id_proposicao = converter_para_int(linha[0] if len(linha) > 0 else None)
                    id_deputado = converter_para_int(linha[1] if len(linha) > 1 else None)
                    cod_tipo_autor = converter_para_int(linha[2] if len(linha) > 2 else None)
                    tipo_autor = linha[3].strip() if len(linha) > 3 and linha[3] else None
                    ordem_assinatura = converter_para_int(linha[4] if len(linha) > 4 else None)
                    proponente = converter_para_boolean(linha[5] if len(linha) > 5 else None)
                    
                    if not id_proposicao:
                        erro_msg = "ID da proposição é obrigatório"
                        registrar_erro(arquivo_log, 'proposicoes_autores', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    try:
                        cursor.execute("""
                            INSERT INTO proposicoes_autores (
                                id_proposicao, id_deputado, cod_tipo_autor, 
                                tipo_autor, ordem_assinatura, proponente
                            ) VALUES (%s, %s, %s, %s, %s, %s)
                        """, (id_proposicao, id_deputado, cod_tipo_autor, 
                              tipo_autor, ordem_assinatura, proponente))
                        
                        inseridos += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'proposicoes_autores', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if inseridos % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos} registros...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'proposicoes_autores', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM proposicoes_autores")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_proposicoes_autores.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
            # Mostrar amostra dos dados
            cursor.execute("SELECT id_proposicao, id_deputado, tipo_autor, ordem_assinatura, proponente FROM proposicoes_autores LIMIT 5")
            amostra = cursor.fetchall()
            if amostra:
                print("\nAmostra dos dados inseridos:")
                for row in amostra:
                    proponente_str = "Sim" if row[4] else "Não" if row[4] is not None else "N/A"
                    deputado_str = str(row[1]) if row[1] else "N/A"
                    print(f"  Proposição: {row[0]} | Deputado: {deputado_str} | Tipo: {row[2]} | Ordem: {row[3]} | Proponente: {proponente_str}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

def carregar_proposicoes_temas(caminho_arquivo):
    """
    Carrega dados de temas de proposições com coleta de metadados
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'proposicoes_temas',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_proposicoes_temas_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        # Registrar contadores
        metadados['conexao'] = {
            'host': DB_CONFIG['host'],
            'port': DB_CONFIG['port'],
            'database': NOME_BANCO
        }
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("""
            SELECT COUNT(*) FROM proposicoes_temas
        """)
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS proposicoes_temas (
                id_proposicao INTEGER NOT NULL,
                cod_tema INTEGER,
                tema TEXT,
                PRIMARY KEY (id_proposicao, cod_tema)
            )
        """)
        
        print("Tabela 'proposicoes_temas' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            # Processar cada linha do CSV
            for linha in leitor_csv:
                try:
                    id_proposicao = converter_para_int(linha[0] if len(linha) > 0 else None)
                    cod_tema = converter_para_int(linha[1] if len(linha) > 1 else None)
                    tema = linha[2].strip() if len(linha) > 2 and linha[2] else None
                    
                    if not id_proposicao or not cod_tema:
                        erro_msg = "Dados obrigatórios faltando: id_proposicao ou cod_tema"
                        registrar_erro(arquivo_log, 'proposicoes_temas', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    # Tentar inserir
                    try:
                        cursor.execute("""
                            INSERT INTO proposicoes_temas (id_proposicao, cod_tema, tema)
                            VALUES (%s, %s, %s)
                            ON CONFLICT (id_proposicao, cod_tema) DO UPDATE SET
                                tema = EXCLUDED.tema
                        """, (id_proposicao, cod_tema, tema))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'proposicoes_temas', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    # Commit a cada 1000 registros
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'proposicoes_temas', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            # Commit final
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM proposicoes_temas")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            # Coletar estatísticas finais
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'total_linhas_erro': len(linhas_erro),
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            # Salvar metadados
            salvar_metadados(metadados, f"metadados_proposicoes_temas.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo de execução: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        metadados['status'] = 'falha_execucao'
        metadados['erro_mensagem'] = str(e)
        salvar_metadados(metadados, f"metadados_proposicoes_temas.json")
        print(f"Erro: {e}")

def carregar_proposicoes(caminho_arquivo):
    """
    Carrega dados de proposições de um arquivo CSV para o banco de dados com coleta de metadados
    CSV esperado: id_proposicao;sigla_tipo_proposicao;numero_proposicao;ano_proposicao;cod_tipo_proposicao;descricao_tipo_proposicao;ementa;ementa_detalhada;keywords;data_apresentacao;url_inteiro_teor;ultimo_status_data_hora;ultimo_status_descricao_tramitacao;ultimo_status_id_tipo_tramitacao;ultimo_status_descricao_situacao;ultimo_status_id_situacao;ultimo_status_regime;ultimo_status_apreciacao;ultimo_status_despacho
    """
    
    # Iniciar coleta de metadados
    inicio = datetime.now()
    metadados = {
        'tabela': 'proposicoes',
        'arquivo_origem': caminho_arquivo,
        'timestamp_inicio': inicio.isoformat(),
        'status': 'em_andamento'
    }
    
    # Nome do arquivo de log para esta execução
    timestamp_log = datetime.now().strftime("%Y%m%d_%H%M%S")
    arquivo_log = f"erros_proposicoes_{timestamp_log}.txt"
    
    # Garantir que o banco existe
    if not criar_banco_se_nao_existe():
        metadados['status'] = 'falha_criacao_banco'
        salvar_metadados(metadados)
        return
    
    # Configuração completa com o banco
    conn_config = {
        'host': DB_CONFIG['host'],
        'port': DB_CONFIG['port'],
        'database': NOME_BANCO,
        'user': DB_CONFIG['user'],
        'password': DB_CONFIG['password']
    }
    
    try:
        conn = psycopg2.connect(**conn_config)
        cursor = conn.cursor()
        
        print(f"Conectado ao banco {NOME_BANCO}")
        
        # Verificar estado da tabela antes da carga
        cursor.execute("SELECT COUNT(*) FROM proposicoes")
        metadados['registros_antes'] = cursor.fetchone()[0]
        
        # Criar a tabela se não existir
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS proposicoes (
                id_proposicao INTEGER PRIMARY KEY,
                sigla_tipo_proposicao VARCHAR(10),
                numero_proposicao INTEGER,
                ano_proposicao INTEGER,
                cod_tipo_proposicao INTEGER,
                descricao_tipo_proposicao TEXT,
                ementa TEXT,
                ementa_detalhada TEXT,
                keywords TEXT,
                data_apresentacao DATE,
                url_inteiro_teor TEXT,
                ultimo_status_data_hora TIMESTAMP,
                ultimo_status_descricao_tramitacao TEXT,
                ultimo_status_id_tipo_tramitacao INTEGER,
                ultimo_status_descricao_situacao TEXT,
                ultimo_status_id_situacao INTEGER,
                ultimo_status_regime TEXT,
                ultimo_status_apreciacao TEXT,
                ultimo_status_despacho TEXT
            )
        """)
        
        print("Tabela 'proposicoes' verificada/criada")
        
        # Abrir e ler o arquivo CSV
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_csv:
            leitor_csv = csv.reader(arquivo_csv, delimiter=';')
            
            # Pular cabeçalho
            cabecalho = next(leitor_csv)
            metadados['cabecalho'] = cabecalho
            
            # Contadores
            linha_atual = 2
            inseridos = 0
            atualizados = 0
            erros = 0
            linhas_erro = []
            
            print("Iniciando carga de dados...")
            
            for linha in leitor_csv:
                try:
                    # CSV com 19 colunas (incluindo ultimo_status_id_tipo_tramitacao e ultimo_status_despacho)
                    id_proposicao = converter_para_int(linha[0] if len(linha) > 0 else None)
                    sigla_tipo_proposicao = linha[1].strip() if len(linha) > 1 and linha[1] else None
                    numero_proposicao = converter_para_int(linha[2] if len(linha) > 2 else None)
                    ano_proposicao = converter_para_int(linha[3] if len(linha) > 3 else None)
                    cod_tipo_proposicao = converter_para_int(linha[4] if len(linha) > 4 else None)
                    descricao_tipo_proposicao = linha[5].strip() if len(linha) > 5 and linha[5] else None
                    ementa = linha[6].strip() if len(linha) > 6 and linha[6] else None
                    ementa_detalhada = linha[7].strip() if len(linha) > 7 and linha[7] else None
                    keywords = linha[8].strip() if len(linha) > 8 and linha[8] else None
                    data_apresentacao = converter_para_date(linha[9] if len(linha) > 9 else None)
                    url_inteiro_teor = linha[10].strip() if len(linha) > 10 and linha[10] else None
                    ultimo_status_data_hora = converter_para_timestamp(linha[11] if len(linha) > 11 else None)
                    ultimo_status_descricao_tramitacao = linha[12].strip() if len(linha) > 12 and linha[12] else None
                    ultimo_status_id_tipo_tramitacao = converter_para_int(linha[13] if len(linha) > 13 else None)
                    ultimo_status_descricao_situacao = linha[14].strip() if len(linha) > 14 and linha[14] else None
                    ultimo_status_id_situacao = converter_para_int(linha[15] if len(linha) > 15 else None)
                    ultimo_status_regime = linha[16].strip() if len(linha) > 16 and linha[16] else None
                    ultimo_status_apreciacao = linha[17].strip() if len(linha) > 17 and linha[17] else None
                    ultimo_status_despacho = linha[18].strip() if len(linha) > 18 and linha[18] else None
                    
                    if not id_proposicao:
                        erro_msg = "ID da proposição é obrigatório"
                        registrar_erro(arquivo_log, 'proposicoes', linha_atual, linha, erro_msg)
                        erros += 1
                        linhas_erro.append(linha_atual)
                        linha_atual += 1
                        continue
                    
                    try:
                        cursor.execute("""
                            INSERT INTO proposicoes (
                                id_proposicao, sigla_tipo_proposicao, numero_proposicao, ano_proposicao,
                                cod_tipo_proposicao, descricao_tipo_proposicao, ementa, ementa_detalhada,
                                keywords, data_apresentacao, url_inteiro_teor, ultimo_status_data_hora,
                                ultimo_status_descricao_tramitacao, ultimo_status_id_tipo_tramitacao,
                                ultimo_status_descricao_situacao, ultimo_status_id_situacao,
                                ultimo_status_regime, ultimo_status_apreciacao, ultimo_status_despacho
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (id_proposicao) DO UPDATE SET
                                sigla_tipo_proposicao = EXCLUDED.sigla_tipo_proposicao,
                                numero_proposicao = EXCLUDED.numero_proposicao,
                                ano_proposicao = EXCLUDED.ano_proposicao,
                                cod_tipo_proposicao = EXCLUDED.cod_tipo_proposicao,
                                descricao_tipo_proposicao = EXCLUDED.descricao_tipo_proposicao,
                                ementa = EXCLUDED.ementa,
                                ementa_detalhada = EXCLUDED.ementa_detalhada,
                                keywords = EXCLUDED.keywords,
                                data_apresentacao = EXCLUDED.data_apresentacao,
                                url_inteiro_teor = EXCLUDED.url_inteiro_teor,
                                ultimo_status_data_hora = EXCLUDED.ultimo_status_data_hora,
                                ultimo_status_descricao_tramitacao = EXCLUDED.ultimo_status_descricao_tramitacao,
                                ultimo_status_id_tipo_tramitacao = EXCLUDED.ultimo_status_id_tipo_tramitacao,
                                ultimo_status_descricao_situacao = EXCLUDED.ultimo_status_descricao_situacao,
                                ultimo_status_id_situacao = EXCLUDED.ultimo_status_id_situacao,
                                ultimo_status_regime = EXCLUDED.ultimo_status_regime,
                                ultimo_status_apreciacao = EXCLUDED.ultimo_status_apreciacao,
                                ultimo_status_despacho = EXCLUDED.ultimo_status_despacho
                        """, (
                            id_proposicao, sigla_tipo_proposicao, numero_proposicao, ano_proposicao,
                            cod_tipo_proposicao, descricao_tipo_proposicao, ementa, ementa_detalhada,
                            keywords, data_apresentacao, url_inteiro_teor, ultimo_status_data_hora,
                            ultimo_status_descricao_tramitacao, ultimo_status_id_tipo_tramitacao,
                            ultimo_status_descricao_situacao, ultimo_status_id_situacao,
                            ultimo_status_regime, ultimo_status_apreciacao, ultimo_status_despacho
                        ))
                        
                        if cursor.rowcount == 1:
                            inseridos += 1
                        else:
                            atualizados += 1
                        
                    except Exception as e:
                        registrar_erro(arquivo_log, 'proposicoes', linha_atual, linha, str(e))
                        erros += 1
                        linhas_erro.append(linha_atual)
                    
                    if (inseridos + atualizados) % 1000 == 0:
                        conn.commit()
                        print(f"Processados {inseridos + atualizados} registros (Inseridos: {inseridos}, Atualizados: {atualizados})...")
                    
                except Exception as e:
                    registrar_erro(arquivo_log, 'proposicoes', linha_atual, linha, str(e))
                    erros += 1
                    linhas_erro.append(linha_atual)
                
                linha_atual += 1
            
            conn.commit()
            
            # Verificar estado da tabela após a carga
            cursor.execute("SELECT COUNT(*) FROM proposicoes")
            metadados['registros_depois'] = cursor.fetchone()[0]
            
            fim = datetime.now()
            metadados.update({
                'timestamp_fim': fim.isoformat(),
                'duracao_segundos': (fim - inicio).total_seconds(),
                'linhas_processadas': linha_atual - 2,
                'registros_inseridos': inseridos,
                'registros_atualizados': atualizados,
                'erros': erros,
                'primeiras_linhas_erro': linhas_erro[:10],
                'arquivo_erros': f"logs/erros/{arquivo_log}" if erros > 0 else None,
                'status': 'sucesso' if erros == 0 else 'concluido_com_erros'
            })
            
            salvar_metadados(metadados, f"metadados_proposicoes.json")
            
            print(f"\n{'='*50}")
            print(f"CARREGAMENTO CONCLUÍDO!")
            print(f"Registros inseridos: {inseridos}")
            print(f"Registros atualizados: {atualizados}")
            print(f"Erros: {erros}")
            if erros > 0:
                print(f"Arquivo de erros: logs/erros/{arquivo_log}")
            print(f"Tempo: {metadados['duracao_segundos']:.2f} segundos")
            print(f"{'='*50}")
            
            # Mostrar amostra dos dados
            cursor.execute("SELECT id_proposicao, sigla_tipo_proposicao, numero_proposicao, ano_proposicao, ultimo_status_descricao_situacao FROM proposicoes LIMIT 5")
            amostra = cursor.fetchall()
            if amostra:
                print("\nAmostra dos dados inseridos:")
                for row in amostra:
                    print(f"  ID: {row[0]} | Tipo: {row[1]} | Número: {row[2]}/{row[3]} | Situação: {row[4]}")
            
        cursor.close()
        conn.close()
        
    except FileNotFoundError:
        print(f"Arquivo não encontrado: {caminho_arquivo}")
    except Exception as e:
        print(f"Erro: {e}")
        if conn:
            conn.rollback()

if __name__ == "__main__":
    print("=== Carga de Deputados ===")
    print(f"Host: {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print(f"Banco alvo: {NOME_BANCO}")
    print("-" * 50)
    
    # arquivo_deputados_csv = r'dados_finais\deputados.csv'
    # carregar_deputados(arquivo_deputados_csv)
    arquivo_votacao_csv = r'dados_finais\votacoes.csv'  
    carregar_votacao(arquivo_votacao_csv)
    arquivo_orientacao_csv = r'dados_finais\votacoes_orientacoes.csv' #ainda contaminados (fk's inexistentes)
    carregar_votacoes_orientacoes(arquivo_orientacao_csv)
    arquivo_votos_csv = r'dados_finais\votacoes_votos.csv'
    carregar_votacoes_votos(arquivo_votos_csv)
    arquivo_despesas_csv = r'dados_finais\despesas.csv' #ainda contaminados
    carregar_despesas(arquivo_despesas_csv)
    arquivo_eventos_csv = r'dados_finais\eventos.csv' #ainda contaminados
    carregar_eventos(arquivo_eventos_csv)
    arquivo_presenca_csv = r'dados_finais\presencas_resumo.csv' #ainda contaminados (fk's inexistentes)
    carregar_presenca_deputados(arquivo_presenca_csv)
    arquivo_frentes_csv = r'dados_finais\frentes_deputados.csv' #ainda contaminados (não tem data de inicio nem fim e fk's inexistentes)
    carregar_frentes_deputados(arquivo_frentes_csv)
    arquivo_proposicoes_csv = r'dados_finais\proposicoes.csv' #ainda contaminados (fk's inexistentes)
    carregar_proposicoes(arquivo_proposicoes_csv)
    arquivo_proposicoes_autores_csv = r'dados_finais\proposicoes_autores.csv' #ainda contaminados (fk's inexistentes)
    carregar_proposicoes_autores(arquivo_proposicoes_autores_csv)
    arquivo_proposicoes_temas_csv = r'dados_finais\proposicoes_temas.csv' #ainda contaminados (fk's inexistentes)
    carregar_proposicoes_temas(arquivo_proposicoes_temas_csv)
