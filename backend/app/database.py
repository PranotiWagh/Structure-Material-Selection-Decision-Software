import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
DATABASE_DIR = os.path.join(PROJECT_ROOT, "database")

MATERIALS_DB_PATH = os.path.join(DATABASE_DIR, "materials.db")
USERS_DB_PATH = os.path.join(DATABASE_DIR, "users.db")

os.makedirs(DATABASE_DIR, exist_ok=True)

# Engine & Session for Materials & MCDA
materials_engine = create_engine(
    f"sqlite:///{MATERIALS_DB_PATH}",
    connect_args={"check_same_thread": False}
)
MaterialsSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=materials_engine)

# Engine & Session for User Authentication & Roles (database/users.db)
users_engine = create_engine(
    f"sqlite:///{USERS_DB_PATH}",
    connect_args={"check_same_thread": False}
)
UsersSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=users_engine)

# Base models
Base = declarative_base()
UserBase = declarative_base()

# Backward-compatibility alias
engine = materials_engine
SessionLocal = MaterialsSessionLocal

def get_db():
    db = MaterialsSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user_db():
    db = UsersSessionLocal()
    try:
        yield db
    finally:
        db.close()
