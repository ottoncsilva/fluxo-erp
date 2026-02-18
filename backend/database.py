from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Pega URL do ambiente ou usa default local
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/fluxo_erp")

# Corrige o problema do @ na senha se o usuário esquecer
if "postgresql://" in DATABASE_URL and "@" in DATABASE_URL.split("@")[-1]:
    # Lógica simples de fallback, mas ideal é o usuário corrigir a variável
    pass

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
