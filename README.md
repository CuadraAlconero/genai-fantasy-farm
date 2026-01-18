# Farm Village Sim

An LLM-powered simulation of life as a newcomer in a fantasy farm village.

## Setup

### Prerequisites

- Python 3.13+
- [uv](https://docs.astral.sh/uv/) package manager

### Installation

```bash
# Clone and enter the project
cd farm-village-sim

# Install dependencies
uv sync
```

### Configuration

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add at least one API key:

```env
# OpenAI (for GPT models)
OPENAI_API_KEY=your-openai-api-key

# Google (for Gemini models)
GOOGLE_API_KEY=your-google-api-key
```

## Character Module

Generate AI-powered characters for the village simulation.

### Basic Usage

```bash
# Generate a random character (uses default provider and model from .env)
uv run python scripts/test_character_init.py
```

### CLI Options

| Option | Short | Description |
|--------|-------|-------------|
| `--provider` | `-p` | LLM provider: `openai` or `gemini` (default: `openai`) |
| `--model` | `-m` | Model name (overrides .env default) |
| `--reasoning` | `-r` | Reasoning effort: `low`, `medium`, `high` |
| `--description` | `-d` | Character concept to guide generation |
| `--json` | `-j` | Output raw JSON instead of formatted tables |

### Examples

```bash
# Generate with a specific character concept
uv run python scripts/test_character_init.py -d "a mysterious blacksmith with a hidden past"

# Use Gemini instead of OpenAI
uv run python scripts/test_character_init.py -p gemini

# Specify a different model
uv run python scripts/test_character_init.py -m gpt-4o

# Use high reasoning effort for more detailed characters
uv run python scripts/test_character_init.py -r high -d "an elderly herbalist"

# Output as JSON (useful for piping to other tools)
uv run python scripts/test_character_init.py -j -d "a young farmer" > character.json
```

### Supported Models

**OpenAI:**
- `gpt-5-mini-2025-08-07` (default)
- `o1-mini`, `o1`, `o3-mini` (reasoning models)
- `gpt-4o`, `gpt-4o-mini`

**Google Gemini:**
- `gemini-3-flash-preview` (default)
- `gemini-2.0-flash-thinking-exp` (thinking model)
- `gemini-2.0-flash`, `gemini-1.5-pro`

### Character Attributes

Generated characters include:

- **Basic Info**: Name, age, gender
- **Appearance**: Height, build, hair, eyes, skin, clothing, distinguishing features
- **Personality**: Temperament, traits, quirks, values, fears
- **Skills**: Occupation, primary/secondary skills, stats (STR/DEX/CON/INT/WIS/CHA)
- **Backstory**: Origin, family, life events, secrets, reason for arrival
- **Portrait Description**: Vivid paragraph for character art generation

## API Server

FastAPI backend for character management and LLM generation.

### Running the API

```bash
# Start the API server
uv run uvicorn farm_village_sim.api.main:app --reload

# Or specify host/port
uv run uvicorn farm_village_sim.api.main:app --host 0.0.0.0 --port 8000 --reload
```

API documentation is available at http://localhost:8000/docs

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/characters` | List all characters |
| `GET` | `/api/characters/{id}` | Get character by ID |
| `POST` | `/api/characters` | Create new character (LLM generation) |
| `DELETE` | `/api/characters/{id}` | Delete character |

### Character Creation Request

```json
{
  "description": "a mysterious blacksmith",
  "name_hint": "Marcus",
  "occupation_hint": "blacksmith",
  "temperament_hint": "choleric",
  "age_min": 30,
  "age_max": 50
}
```

All fields are optional. Providing hints guides the LLM generation.

## Frontend UI

A React + TypeScript frontend for viewing and creating characters.

### Running the Frontend

```bash
# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

**Important:** The frontend requires the API server to be running for character operations.

### Frontend Features

- **Landing Page**: Fantasy-themed welcome screen
- **Dashboard**: Navigation hub with quick access to create characters
- **Characters Tab**: View all village characters with search/filter
- **Character Creation Wizard**: Multi-step form to create new characters via LLM
  - Step 1: Describe your character concept
  - Step 2: Add optional hints (name, occupation, temperament, age)
  - Step 3: Review and generate
  - Step 4: View the result and save

### Running Both Together

```bash
# Terminal 1: Start the API server
uv run uvicorn farm_village_sim.api.main:app --reload

# Terminal 2: Start the frontend
cd frontend && npm run dev
```

## Development

### Linting & Formatting

```bash
# Run linter
uv run ruff check .

# Format code
uv run ruff format .
```

### Project Structure

```
farm-village-sim/
├── src/farm_village_sim/
│   ├── api/              # FastAPI backend
│   │   ├── main.py       # App entry point with CORS
│   │   ├── routers/      # API route handlers
│   │   │   └── characters.py
│   │   └── services/     # Business logic
│   │       └── character_service.py
│   ├── characters/       # Character models and generation
│   │   ├── models.py     # Pydantic data models
│   │   ├── prompts.py    # LLM prompt templates
│   │   └── initializer.py # Character generation & storage
│   ├── llm/              # LLM provider abstraction
│   │   └── providers.py  # OpenAI & Gemini providers
│   ├── world/            # World simulation (TBD)
│   ├── core/             # Core game logic (TBD)
│   └── ui/               # User interface (TBD)
├── frontend/             # React + TypeScript UI
│   ├── src/
│   │   ├── pages/        # Landing, Dashboard, Characters, CreateCharacter
│   │   ├── types/        # TypeScript interfaces
│   │   ├── hooks/        # API hooks (useCharacters, useCreateCharacter)
│   │   └── components/   # WizardStep, CharacterPreview, etc.
│   └── public/
├── data/characters/      # Saved character JSON files
├── scripts/
│   └── test_character_init.py  # Character generation CLI
└── tests/                # Test suite
```
