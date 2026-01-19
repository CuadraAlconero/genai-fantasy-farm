# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Farm Village Sim is an LLM-powered simulation of life as a newcomer in a fantasy farm village. The project consists of a Python backend (FastAPI) and a React TypeScript frontend, with LLM-based character and event generation at its core.

## Project Structure

The repository is organized into two main directories at the root:

```
farm-village-sim/
├── backend/           # Python backend (FastAPI + LangChain)
│   ├── src/           # Source code (farm_village_sim package)
│   ├── tests/         # Backend tests
│   ├── scripts/       # CLI test scripts
│   ├── data/          # JSON persistence (characters, events)
│   ├── pyproject.toml # Python project config
│   ├── uv.lock        # Dependency lock file
│   └── .env.example   # Environment variables template
└── frontend/          # React + TypeScript + Vite
    ├── src/           # Frontend source code
    ├── public/        # Static assets
    └── package.json   # Node dependencies
```

This structure separates backend and frontend concerns, making it easier to deploy, test, and develop each independently.

## Development Commands

### Backend (Python with uv)

All backend commands should be run from the `backend/` directory:

```bash
cd backend

# Install dependencies
uv sync

# Run linter
uv run ruff check .

# Auto-fix linting issues
uv run ruff check . --fix

# Format code
uv run ruff format .

# Type checking
uv run mypy src/

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=farm_village_sim tests/

# Run a single test file
uv run pytest tests/test_specific.py

# Start API server
uv run uvicorn farm_village_sim.api.main:app --reload

# Generate a character via CLI
uv run python scripts/test_character_init.py -d "character description"

# Generate an event via CLI
uv run python scripts/test_event_generator.py generate -a data/characters/abc.json -b data/characters/def.json
```

### Frontend (React + TypeScript + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Architecture

### LLM Provider Abstraction (`backend/src/farm_village_sim/llm/`)

The codebase uses a provider abstraction layer built on LangChain to support multiple LLM providers (OpenAI, Google Gemini). This abstraction allows:
- Consistent interface via `LLMProvider.get_model()` returning `BaseChatModel`
- Provider-specific reasoning effort configuration (OpenAI's reasoning_effort vs Gemini's thinking_budget)
- Support for both standard and reasoning models (o1, o3, gemini-thinking, etc.)
- Environment-based configuration via `LLMSettings` (Pydantic settings)

All LLM interactions use `.with_structured_output()` for Pydantic model validation, ensuring type-safe responses.

### Character Generation (`backend/src/farm_village_sim/characters/`)

Characters are generated using LLM structured output with Pydantic models:
- `Character` model composes: Appearance, Personality, Backstory, Skills, StatBlock
- Generation uses Jinja2 prompt templates in `prompts.py`
- `CharacterInitializer` handles LLM invocation and JSON file persistence to `backend/data/characters/`
- Each character gets a UUID and is saved as `{uuid}.json`

### Event Generation with LangGraph (`backend/src/farm_village_sim/events/`)

Events are dynamic multi-turn interactions between two characters using LangGraph state machines:
- **State Graph**: Character A → Supervisor → Character B → Supervisor → ... → End
- **Supervisor Node**: Uses structured output (`SupervisorDecision`) to:
  - Decide if event continues or ends
  - Track and update character moods
  - Choose next speaker
  - Provide end reason
- **Character Nodes**: Generate dialogue/action via structured output (`CharacterResponse`)
- **State**: `EventState` (Pydantic) tracks turns, moods, messages using LangGraph's `add_messages` reducer
- **Output**: Events saved as `backend/data/events/{uuid}.json` with transcript, summary, outcome

The graph architecture ensures:
1. Characters never speak out of turn (supervisor controls flow)
2. Moods evolve based on interactions
3. Natural conversation length (min/max interactions configurable)
4. Structured data for frontend rendering

### FastAPI Backend (`backend/src/farm_village_sim/api/`)

Standard FastAPI structure with separation of concerns:
- `main.py`: App setup, CORS middleware for frontend dev
- `routers/`: Route handlers for `/api/characters` and `/api/events`
- `services/`: Business logic (character_service.py, event_service.py)
  - Services orchestrate LLM providers, file I/O, validation
  - Keep routers thin (validation/HTTP) and services thick (logic)

API uses Pydantic request/response models for validation. Characters and events are persisted as JSON files in `backend/data/` directory, not a database.

### React Frontend (`frontend/src/`)

Component structure:
- `pages/`: Full page components (Landing, Dashboard, Characters, CreateCharacter, Events, CreateEvent, EventViewer)
- `hooks/`: API interaction hooks (`useCharacters`, `useCreateCharacter`, `useEvents`)
- `components/`: Reusable UI components (WizardStep, CharacterPreview, SpeechBubble, TurnDisplay, CharacterPortrait)
- `types/`: TypeScript interfaces matching backend Pydantic models

The frontend expects the backend API to be running at `http://localhost:8000`.

### Data Persistence

All data is stored as JSON files in the backend directory:
- `backend/data/characters/{uuid}.json`: Generated character data
- `backend/data/events/{uuid}.json`: Event transcripts with metadata

No database is used. The file-based approach is intentional for simplicity and portability.

## Configuration

Environment variables are loaded from `backend/.env` (copy from `backend/.env.example`):
- `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_REASONING_EFFORT`
- `GOOGLE_API_KEY`, `GEMINI_MODEL`, `GEMINI_REASONING_EFFORT`

At least one provider's API key must be set. Default models and reasoning efforts are defined in `LLMSettings`.

## Code Style

- **Python**: Follows Ruff configuration in `backend/pyproject.toml` (line length 88, strict type checking with mypy)
- **TypeScript**: ESLint configuration in `frontend/eslint.config.js`
- **Imports**: Python uses isort (farm_village_sim as first-party), auto-organized by Ruff

When adding new LLM interactions:
1. Define Pydantic response model in `models.py`
2. Create prompt template in `prompts.py` (use Jinja2 for complex prompts)
3. Use `model.with_structured_output(PydanticModel)` for type-safe responses
4. Handle both sync and async patterns (FastAPI uses async)
