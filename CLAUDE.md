# CLAUDE.md - Backend

This file provides guidance to Claude Code (claude.ai/code) when working with the Python backend code in this repository.

## Project Overview

Farm Village Sim is an LLM-powered simulation of life as a newcomer in a fantasy farm village. This is the **backend** portion of the project, built with Python, FastAPI, and LangChain.

The backend provides:
- Character generation using LLM structured output
- Event generation using LangGraph state machines
- REST API for frontend integration
- Multi-provider LLM support (OpenAI, Google Gemini)

## Development Commands

### Setup

```bash
# Install dependencies
uv sync

# Copy environment configuration
cp .env.example .env
# Then edit .env with your API keys
```

### Code Quality

```bash
# Run linter
uv run ruff check .

# Auto-fix linting issues
uv run ruff check . --fix

# Format code
uv run ruff format .

# Type checking
uv run mypy src/
```

### Testing

```bash
# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=farm_village_sim tests/

# Run a single test file
uv run pytest tests/test_specific.py

# Run specific test
uv run pytest tests/test_file.py::test_function_name
```

### Running the API Server

```bash
# Start API server with hot reload
uv run uvicorn farm_village_sim.api.main:app --reload

# Start on specific port
uv run uvicorn farm_village_sim.api.main:app --reload --port 8001

# API will be available at http://localhost:8000
# Interactive docs at http://localhost:8000/docs
```

### CLI Tools

```bash
# Generate a character via CLI
uv run python scripts/test_character_init.py -d "character description"

# Generate an event via CLI
uv run python scripts/test_event_generator.py generate -a data/characters/abc.json -b data/characters/def.json
```

## Architecture

### Project Structure

```
src/farm_village_sim/
├── api/              # FastAPI application
│   ├── main.py       # App setup, CORS, middleware
│   ├── routers/      # Route handlers (/api/characters, /api/events)
│   └── services/     # Business logic (character_service, event_service)
├── characters/       # Character generation
│   ├── models.py     # Pydantic models (Character, Appearance, etc.)
│   ├── prompts.py    # Jinja2 prompt templates
│   └── initializer.py # CharacterInitializer class
├── events/           # Event generation with LangGraph
│   ├── models.py     # EventState, SupervisorDecision, etc.
│   ├── graph.py      # LangGraph state machine
│   └── generator.py  # EventGenerator orchestration
└── llm/              # LLM provider abstraction
    ├── provider.py   # LLMProvider interface
    └── settings.py   # LLMSettings (Pydantic config)
```

### LLM Provider Abstraction (`src/farm_village_sim/llm/`)

The codebase uses a provider abstraction layer built on LangChain to support multiple LLM providers:

**Key Features:**
- Consistent interface via `LLMProvider.get_model()` returning `BaseChatModel`
- Provider-specific reasoning effort configuration:
  - OpenAI: `reasoning_effort` parameter (low/medium/high)
  - Gemini: `thinking_budget` parameter (tokens)
- Support for both standard and reasoning models (o1, o3, gemini-thinking, etc.)
- Environment-based configuration via `LLMSettings` (Pydantic settings)

**Usage Pattern:**
```python
from farm_village_sim.llm import LLMProvider

model = LLMProvider.get_model()
structured_model = model.with_structured_output(PydanticModel)
result = await structured_model.ainvoke(prompt)
```

All LLM interactions use `.with_structured_output()` for Pydantic model validation, ensuring type-safe responses.

### Character Generation (`src/farm_village_sim/characters/`)

Characters are generated using LLM structured output with Pydantic models:

**Data Models:**
- `Character` model composes: Appearance, Personality, Backstory, Skills, StatBlock
- All models are Pydantic with validation and serialization
- Models define the schema for LLM structured output

**Generation Flow:**
1. User provides character description
2. `CharacterInitializer` loads Jinja2 prompt template from `prompts.py`
3. LLM generates structured `Character` object
4. Character is assigned a UUID
5. Saved as JSON to `data/characters/{uuid}.json`

**Key Classes:**
- `CharacterInitializer`: Handles LLM invocation and file persistence
- Prompt templates use Jinja2 for flexibility and maintainability

### Event Generation with LangGraph (`src/farm_village_sim/events/`)

Events are dynamic multi-turn interactions between two characters using LangGraph state machines.

**State Graph Architecture:**
```
Character A → Supervisor → Character B → Supervisor → ... → End
```

**Node Types:**
1. **Supervisor Node** (`SupervisorDecision`):
   - Decides if event continues or ends
   - Tracks and updates character moods
   - Chooses next speaker
   - Provides end reason when complete

2. **Character Nodes** (`CharacterResponse`):
   - Generate dialogue/action via structured output
   - Based on character's personality, current mood, and conversation history

**State Management:**
- `EventState` (Pydantic) tracks:
  - Turn counter
  - Character moods
  - Message history (using LangGraph's `add_messages` reducer)
  - Current speaker

**Output:**
- Events saved as `data/events/{uuid}.json`
- Contains full transcript, summary, and outcome
- Structured for frontend rendering

**Key Guarantees:**
1. Characters never speak out of turn (supervisor controls flow)
2. Moods evolve based on interactions
3. Natural conversation length (min/max interactions configurable)
4. All output is structured data (no raw text parsing)

### FastAPI Backend (`src/farm_village_sim/api/`)

Standard FastAPI structure with separation of concerns:

**Components:**
- `main.py`: App setup, CORS middleware (configured for frontend dev at localhost:5173)
- `routers/`: Thin route handlers
  - `/api/characters`: Character CRUD operations
  - `/api/events`: Event generation and retrieval
- `services/`: Thick business logic
  - `character_service.py`: Character generation, persistence, retrieval
  - `event_service.py`: Event generation orchestration

**Design Principles:**
- Keep routers thin (validation/HTTP concerns only)
- Keep services thick (business logic, LLM orchestration, file I/O)
- Use Pydantic request/response models for validation
- All async (FastAPI async patterns)

**Data Persistence:**
- No database used
- JSON file storage in `data/` directory:
  - `data/characters/{uuid}.json`
  - `data/events/{uuid}.json`
- File-based approach is intentional for simplicity and portability

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o              # or gpt-4o-mini, o1, o3-mini
OPENAI_REASONING_EFFORT=medium   # low, medium, high (for reasoning models)

# Google Gemini Configuration
GOOGLE_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash-thinking-exp
GEMINI_REASONING_EFFORT=8192     # thinking budget in tokens
```

**Requirements:**
- At least one provider's API key must be set
- Default models and reasoning efforts are defined in `LLMSettings`
- Settings are loaded via Pydantic BaseSettings (environment priority)

## Code Style

### Python Style Guide

- **Formatter**: Ruff (line length 88, compatible with Black)
- **Linter**: Ruff (replaces flake8, isort, etc.)
- **Type Checker**: mypy with strict mode
- **Imports**: isort-style ordering (stdlib → third-party → first-party)
  - `farm_village_sim` is configured as first-party in pyproject.toml

### Best Practices

**When adding new LLM interactions:**
1. Define Pydantic response model in `models.py`
2. Create prompt template in `prompts.py` (use Jinja2 for complex prompts)
3. Use `model.with_structured_output(PydanticModel)` for type-safe responses
4. Handle both sync and async patterns (FastAPI uses async)

**Structured Output Pattern:**
```python
from pydantic import BaseModel
from farm_village_sim.llm import LLMProvider

class MyResponse(BaseModel):
    field1: str
    field2: int

model = LLMProvider.get_model()
structured_model = model.with_structured_output(MyResponse)
result: MyResponse = await structured_model.ainvoke("prompt")
```

**Error Handling:**
- Use FastAPI's HTTPException for API errors
- Log errors appropriately
- Provide meaningful error messages to frontend

**Testing:**
- Write unit tests for services
- Use pytest fixtures for common test data
- Mock LLM calls in tests (use fixtures for sample responses)
- Test both success and error paths

## Common Tasks

### Adding a New API Endpoint

1. Define request/response Pydantic models
2. Add route handler in appropriate router file
3. Implement business logic in service file
4. Add tests for new endpoint
5. Run linter and type checker
6. Test manually via /docs (Swagger UI)

### Adding a New Character Attribute

1. Update `Character` model in `src/farm_village_sim/characters/models.py`
2. Update prompt template in `src/farm_village_sim/characters/prompts.py`
3. Update any affected tests
4. Regenerate sample characters to verify

### Debugging LLM Calls

- Enable debug logging in LangChain (set `LANGCHAIN_VERBOSE=true`)
- Check prompt templates are rendering correctly
- Verify structured output schema matches Pydantic model
- Test with simpler models first (e.g., gpt-4o-mini)

### Working with LangGraph

- Use LangGraph Studio for visualization (requires langchain-cli)
- Debug by adding print statements in node functions
- Check state transitions are as expected
- Verify supervisor decisions make sense

## Related Documentation

- Frontend documentation: See `frontend/CLAUDE.md`
- Main project README: See `README.md`
- API documentation (when server running): http://localhost:8000/docs
