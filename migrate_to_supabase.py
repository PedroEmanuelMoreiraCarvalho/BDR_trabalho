import psycopg2
import sys
import io
import time

def run_migration(supabase_conn_str):
    local_conn_config = {
        'host': 'localhost',
        'port': 5432,
        'user': 'admin',
        'password': 'admin123',
        'database': 'backend'
    }
    
    tables = [
        'deputados',
        'eventos',
        'proposicoes',
        'votacao',
        'votacoes_orientacoes',
        'votacoes_votos',
        'despesas',
        'presenca_deputados',
        'frentes_deputados',
        'proposicoes_autores',
        'proposicoes_temas'
    ]
    
    print("Connecting to local database...")
    try:
        local_conn = psycopg2.connect(**local_conn_config)
        local_cur = local_conn.cursor()
        print("Connected to local database.")
    except Exception as e:
        print(f"Failed to connect to local database: {e}")
        return
        
    print("Connecting to Supabase database...")
    try:
        supa_conn = psycopg2.connect(supabase_conn_str)
        supa_cur = supa_conn.cursor()
        print("Connected to Supabase database.")
    except Exception as e:
        print(f"Failed to connect to Supabase database: {e}")
        local_conn.close()
        return

    try:
        # Step 1: Drop existing materialized views and tables on Supabase
        print("\nDropping existing tables and views on Supabase...")
        supa_cur.execute("DROP MATERIALIZED VIEW IF EXISTS mv_deputados_consolidado CASCADE;")
        for table in tables:
            supa_cur.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
        supa_conn.commit()
        print("Dropped existing structures successfully.")
        
        # Step 2: Create schema
        print("\nReading schema script (criar_tabelas_sql.sql)...")
        with open("criar_tabelas_sql.sql", "r", encoding="utf-8") as f:
            schema_sql = f.read()
            
        print("Running schema creation SQL on Supabase...")
        supa_cur.execute(schema_sql)
        supa_conn.commit()
        print("Tables and view created successfully on Supabase.")
        
        # Step 3: Enable unaccent extension (needed for DatabaseAdapter)
        print("\nEnabling unaccent extension on Supabase...")
        supa_cur.execute("CREATE EXTENSION IF NOT EXISTS unaccent;")
        supa_conn.commit()
        print("unaccent extension enabled.")
        
        # Step 4: Transfer data for each table
        print("\nStarting data migration...")
        for table in tables:
            t0 = time.time()
            print(f"Migrating table '{table}'...")
            
            # Count rows locally
            local_cur.execute(f"SELECT COUNT(*) FROM {table}")
            total_rows = local_cur.fetchone()[0]
            print(f"  Rows to copy: {total_rows}")
            
            if total_rows == 0:
                print(f"  Table '{table}' is empty, skipping.")
                continue
                
            # Perform stream copy
            # We copy TO a memory stream locally, then COPY FROM that stream to Supabase
            buffer = io.BytesIO()
            local_cur.copy_to(buffer, table, sep='\t', null='\\N')
            buffer.seek(0)
            
            supa_cur.copy_from(buffer, table, sep='\t', null='\\N')
            supa_conn.commit()
            
            # Count rows on Supabase to verify
            supa_cur.execute(f"SELECT COUNT(*) FROM {table}")
            supa_rows = supa_cur.fetchone()[0]
            
            t1 = time.time()
            print(f"  Copied successfully! Supabase row count: {supa_rows} / {total_rows} ({t1 - t0:.2f}s)")
            
        # Step 5: Refresh materialized view on Supabase
        print("\nRefreshing materialized view 'mv_deputados_consolidado' on Supabase...")
        supa_cur.execute("REFRESH MATERIALIZED VIEW mv_deputados_consolidado;")
        supa_conn.commit()
        print("Materialized view refreshed.")
        
        print("\n==============================================")
        print("MIGRATION COMPLETED SUCCESSFULLY!")
        print("==============================================")

    except Exception as e:
        print(f"\nError during migration: {e}")
        supa_conn.rollback()
    finally:
        local_cur.close()
        local_conn.close()
        supa_cur.close()
        supa_conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python migrate_to_supabase.py <supabase_connection_string>")
        sys.exit(1)
    run_migration(sys.argv[1])
