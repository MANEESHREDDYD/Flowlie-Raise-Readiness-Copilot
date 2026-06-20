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
    """Apply additive V1.1/V1.2 columns to an existing local SQLite file.

    Each entry is (table, column, ALTER statement). The V1.2 operator console
    adds a ``review_status`` column to every generated-output table so that
    drafts default to ``needs_review`` until an operator reviews them.
    """
    inspector = inspect(engine)
    migrations = [
        ("companies", "is_demo", "ALTER TABLE companies ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT 0"),
        ("companies", "portfolio_top_risk", "ALTER TABLE companies ADD COLUMN portfolio_top_risk VARCHAR(160)"),
        ("risk_flags", "why_matters_to_investors", "ALTER TABLE risk_flags ADD COLUMN why_matters_to_investors TEXT NOT NULL DEFAULT ''"),
        ("action_items", "estimated_score_lift", "ALTER TABLE action_items ADD COLUMN estimated_score_lift FLOAT NOT NULL DEFAULT 0"),
        ("risk_flags", "review_status", "ALTER TABLE risk_flags ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'needs_review'"),
        ("investor_questions", "review_status", "ALTER TABLE investor_questions ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'needs_review'"),
        ("action_items", "review_status", "ALTER TABLE action_items ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'needs_review'"),
        ("readiness_scores", "review_status", "ALTER TABLE readiness_scores ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'needs_review'"),
        ("documents", "review_status", "ALTER TABLE documents ADD COLUMN review_status VARCHAR(20) NOT NULL DEFAULT 'needs_review'"),
        ("documents", "evidence_quality", "ALTER TABLE documents ADD COLUMN evidence_quality VARCHAR(20) NOT NULL DEFAULT 'strong'"),
        ("risk_flags", "evidence_quality", "ALTER TABLE risk_flags ADD COLUMN evidence_quality VARCHAR(20) NOT NULL DEFAULT 'strong'"),
        ("risk_flags", "operator_note", "ALTER TABLE risk_flags ADD COLUMN operator_note TEXT NOT NULL DEFAULT ''"),
        ("risk_flags", "founder_facing_note", "ALTER TABLE risk_flags ADD COLUMN founder_facing_note TEXT NOT NULL DEFAULT ''"),
        ("risk_flags", "reviewed_by", "ALTER TABLE risk_flags ADD COLUMN reviewed_by VARCHAR(120)"),
        ("risk_flags", "reviewed_at", "ALTER TABLE risk_flags ADD COLUMN reviewed_at DATETIME"),
        ("action_items", "evidence_quality", "ALTER TABLE action_items ADD COLUMN evidence_quality VARCHAR(20) NOT NULL DEFAULT 'strong'"),
        ("action_items", "operator_note", "ALTER TABLE action_items ADD COLUMN operator_note TEXT NOT NULL DEFAULT ''"),
        ("action_items", "founder_facing_note", "ALTER TABLE action_items ADD COLUMN founder_facing_note TEXT NOT NULL DEFAULT ''"),
        ("action_items", "reviewed_by", "ALTER TABLE action_items ADD COLUMN reviewed_by VARCHAR(120)"),
        ("action_items", "reviewed_at", "ALTER TABLE action_items ADD COLUMN reviewed_at DATETIME"),
        ("investor_questions", "evidence_quality", "ALTER TABLE investor_questions ADD COLUMN evidence_quality VARCHAR(20) NOT NULL DEFAULT 'strong'"),
        ("cap_table_entries", "is_founder", "ALTER TABLE cap_table_entries ADD COLUMN is_founder BOOLEAN NOT NULL DEFAULT 0"),
    ]
    table_names = set(inspector.get_table_names())
    with engine.begin() as connection:
        for table, column, statement in migrations:
            if table not in table_names:
                continue
            existing = {item["name"] for item in inspector.get_columns(table)}
            if column not in existing:
                connection.execute(text(statement))
