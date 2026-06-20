from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker


API_ROOT = Path(__file__).resolve().parents[1]
DATABASE_PATH = API_ROOT / "flowlie.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"


class Base(DeclarativeBase):
    pass


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_v11_columns() -> None:
    """Apply the two additive V1.1 columns to an existing local SQLite file."""
    inspector = inspect(engine)
    migrations = {
        "risk_flags": (
            "why_matters_to_investors",
            "ALTER TABLE risk_flags ADD COLUMN why_matters_to_investors TEXT NOT NULL DEFAULT ''",
        ),
        "action_items": (
            "estimated_score_lift",
            "ALTER TABLE action_items ADD COLUMN estimated_score_lift FLOAT NOT NULL DEFAULT 0",
        ),
    }
    with engine.begin() as connection:
        for table, (column, statement) in migrations.items():
            if table not in inspector.get_table_names():
                continue
            existing = {item["name"] for item in inspector.get_columns(table)}
            if column not in existing:
                connection.execute(text(statement))
