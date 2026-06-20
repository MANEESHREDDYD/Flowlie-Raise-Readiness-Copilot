from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine, ensure_v11_columns
from .routes import action_plan, companies, compliance, demo, documents, financials, investor_qa, readiness, risks


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_v11_columns()
    yield


app = FastAPI(
    title="Flowlie Raise Readiness Copilot API",
    description="Local-first, deterministic fundraising diligence intelligence for synthetic startup data.",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in [
    demo.router, companies.router, documents.router, financials.router, readiness.router,
    risks.router, investor_qa.router, action_plan.router, compliance.router,
]:
    app.include_router(router)


@app.get("/")
def root():
    return {"name": "Flowlie Raise Readiness Copilot API", "docs": "/docs", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}
