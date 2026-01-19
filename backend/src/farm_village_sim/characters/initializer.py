"""Character initialization using LLM-powered generation."""

import uuid
from pathlib import Path

from langchain_core.messages import HumanMessage, SystemMessage

from farm_village_sim.characters.models import Character
from farm_village_sim.characters.prompts import (
    CHARACTER_SYSTEM_PROMPT,
    CHARACTER_USER_PROMPT_TEMPLATE,
)
from farm_village_sim.llm.providers import LLMProvider

# Default directory for character storage
DEFAULT_CHARACTERS_DIR = Path("data/characters")


class CharacterInitializer:
    """Generates random characters using an LLM."""

    def __init__(self, provider: LLMProvider) -> None:
        """Initialize the character generator.

        Args:
            provider: The LLM provider to use for generation.
        """
        self._provider = provider
        self._model = provider.get_model()

    def create_character(self, description: str | None = None) -> Character:
        """Create a new character using the LLM.

        Args:
            description: Optional brief description to guide character creation.
                        Example: "a mysterious blacksmith with a hidden past"

        Returns:
            Character: A fully generated character with all attributes.
        """
        # Build the user prompt
        if description:
            description_section = f"Character concept: {description}"
        else:
            description_section = (
                "No specific concept provided - create a random villager "
                "with an interesting but believable background."
            )

        user_prompt = CHARACTER_USER_PROMPT_TEMPLATE.format(
            description_section=description_section
        )

        # Use structured output for Pydantic model generation
        structured_model = self._model.with_structured_output(Character)

        messages = [
            SystemMessage(content=CHARACTER_SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]

        result = structured_model.invoke(messages)

        # Type assertion - with_structured_output returns the Pydantic model
        if not isinstance(result, Character):
            raise TypeError(f"Expected Character, got {type(result)}")

        return result

    async def create_character_async(self, description: str | None = None) -> Character:
        """Create a new character using the LLM asynchronously.

        Args:
            description: Optional brief description to guide character creation.

        Returns:
            Character: A fully generated character with all attributes.
        """
        # Build the user prompt
        if description:
            description_section = f"Character concept: {description}"
        else:
            description_section = (
                "No specific concept provided - create a random villager "
                "with an interesting but believable background."
            )

        user_prompt = CHARACTER_USER_PROMPT_TEMPLATE.format(
            description_section=description_section
        )

        # Use structured output for Pydantic model generation
        structured_model = self._model.with_structured_output(Character)

        messages = [
            SystemMessage(content=CHARACTER_SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]

        result = await structured_model.ainvoke(messages)

        if not isinstance(result, Character):
            raise TypeError(f"Expected Character, got {type(result)}")

        return result

    @staticmethod
    def save_character(
        character: Character,
        path: Path | None = None,
    ) -> Path:
        """Save a character to a JSON file.

        Args:
            character: The character to save.
            path: Optional custom path. If None, saves to data/characters/{id}.json

        Returns:
            Path: The path where the character was saved.
        """
        # Assign ID if not already set
        if character.id is None:
            character = character.model_copy(update={"id": str(uuid.uuid4())})

        # Determine save path
        if path is None:
            save_dir = DEFAULT_CHARACTERS_DIR
            save_dir.mkdir(parents=True, exist_ok=True)
            path = save_dir / f"{character.id}.json"
        else:
            path.parent.mkdir(parents=True, exist_ok=True)

        # Save as JSON
        path.write_text(character.model_dump_json(indent=2))

        return path

    @staticmethod
    def load_character(path: Path) -> Character:
        """Load a character from a JSON file.

        Args:
            path: Path to the character JSON file.

        Returns:
            Character: The loaded character.
        """
        return Character.model_validate_json(path.read_text())

    @staticmethod
    def list_characters(directory: Path | None = None) -> list[Character]:
        """List all saved characters from a directory.

        Args:
            directory: Directory to search. Defaults to data/characters/

        Returns:
            list[Character]: List of all characters found.
        """
        if directory is None:
            directory = DEFAULT_CHARACTERS_DIR

        if not directory.exists():
            return []

        characters = []
        for json_file in directory.glob("*.json"):
            try:
                characters.append(Character.model_validate_json(json_file.read_text()))
            except Exception:
                # Skip invalid files
                continue

        return characters
