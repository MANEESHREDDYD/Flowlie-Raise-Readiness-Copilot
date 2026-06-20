import os
import tempfile
import uuid
from pathlib import Path

import pytest


TEST_DATABASE_PATH = Path(tempfile.gettempdir()) / f"flowlie-test-{uuid.uuid4().hex}.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DATABASE_PATH.as_posix()}"

from app.database import Base, SessionLocal, engine
from app.seed import seed_demo


@pytest.fixture(autouse=True)
def isolated_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    try:
        yield
    finally:
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    session = SessionLocal()
    seed_demo(session)
    try:
        yield session
    finally:
        session.close()


def pytest_sessionfinish(session, exitstatus):
    engine.dispose()
    TEST_DATABASE_PATH.unlink(missing_ok=True)
