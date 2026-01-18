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
│   ├── characters/       # Character models and generation
│   │   ├── models.py     # Pydantic data models
│   │   ├── prompts.py    # LLM prompt templates
│   │   └── initializer.py # Character generation logic
│   ├── llm/              # LLM provider abstraction
│   │   └── providers.py  # OpenAI & Gemini providers
│   ├── world/            # World simulation (TBD)
│   ├── core/             # Core game logic (TBD)
│   └── ui/               # User interface (TBD)
├── scripts/
│   └── test_character_init.py  # Character generation CLI
└── tests/                # Test suite
```
