"""FastAPI application for Farm Village Sim."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from farm_village_sim.api.routers import characters, events

app = FastAPI(
    title="Farm Village Sim API",
    description="API for the LLM-powered fantasy farm village simulation",
    version="0.1.0",
)

# Configure CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(characters.router, prefix="/api/characters", tags=["characters"])
app.include_router(events.router, prefix="/api/events", tags=["events"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint with API info."""
    return {
        "name": "Farm Village Sim API",
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}
