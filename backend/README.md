# Farm Village Sim - Backend

Python backend for Farm Village Sim, an LLM-powered simulation of life as a newcomer in a fantasy farm village.

## Quick Start

```bash
# Install dependencies
uv sync

# Start the API server
uv run uvicorn farm_village_sim.api.main:app --reload
```

For full documentation, see the main [project README](../README.md) and [CLAUDE.md](../CLAUDE.md).

## Technology Stack

- **FastAPI**: Modern async web framework
- **LangChain**: LLM orchestration and provider abstraction
- **LangGraph**: Stateful agent workflows for event generation
- **Pydantic**: Data validation and settings management
- **uv**: Fast Python package manager

## Key Features

- Multi-LLM provider support (OpenAI, Google Gemini)
- Character generation with structured output
- Event generation using LangGraph state machines
- JSON file-based persistence
