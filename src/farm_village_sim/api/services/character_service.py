"""Character service for business logic."""

import time
from pathlib import Path

from pydantic import BaseModel

from farm_village_sim.characters.initializer import (
    DEFAULT_CHARACTERS_DIR,
    CharacterInitializer,
)
from farm_village_sim.characters.models import Character, Temperament
from farm_village_sim.llm.providers import LLMProvider, get_provider


class CharacterCreateRequest(BaseModel):
    """Request model for character creation."""

    description: str | None = None
    # Optional wizard hints
    name_hint: str | None = None
    occupation_hint: str | None = None
    temperament_hint: Temperament | None = None
    age_min: int | None = None
    age_max: int | None = None


class CharacterCreateResponse(BaseModel):
    """Response model for character creation."""

    character: Character
    generation_time_ms: int


class CharacterService:
    """Service for character CRUD operations."""

    def __init__(
        self,
        provider: LLMProvider | None = None,
        storage_dir: Path | None = None,
    ) -> None:
        """Initialize the character service.

        Args:
            provider: LLM provider for character generation. If None, uses default.
            storage_dir: Directory for character storage. If None, uses default.
        """
        self._provider = provider or get_provider("openai")
        self._storage_dir = storage_dir or DEFAULT_CHARACTERS_DIR
        self._initializer = CharacterInitializer(self._provider)

    def list_characters(self) -> list[Character]:
        """List all saved characters.

        Returns:
            List of all characters in storage.
        """
        return CharacterInitializer.list_characters(self._storage_dir)

    def get_character(self, character_id: str) -> Character | None:
        """Get a character by ID.

        Args:
            character_id: The character's unique ID.

        Returns:
            The character if found, None otherwise.
        """
        path = self._storage_dir / f"{character_id}.json"
        if not path.exists():
            return None
        return CharacterInitializer.load_character(path)

    def create_character(
        self,
        request: CharacterCreateRequest,
    ) -> CharacterCreateResponse:
        """Create a new character using LLM generation.

        Args:
            request: Character creation request with optional hints.

        Returns:
            Response containing the generated character and timing info.
        """
        # Build description from hints
        description_parts = []

        if request.description:
            description_parts.append(request.description)

        if request.name_hint:
            description_parts.append(
                f"Their name should be similar to '{request.name_hint}'"
            )

        if request.occupation_hint:
            description_parts.append(f"They work as a {request.occupation_hint}")

        if request.temperament_hint:
            description_parts.append(
                f"They have a {request.temperament_hint.value} temperament"
            )

        if request.age_min is not None and request.age_max is not None:
            description_parts.append(
                f"They are between {request.age_min} and {request.age_max} years old"
            )
        elif request.age_min is not None:
            description_parts.append(f"They are at least {request.age_min} years old")
        elif request.age_max is not None:
            description_parts.append(f"They are at most {request.age_max} years old")

        description = ". ".join(description_parts) if description_parts else None

        # Generate character
        start_time = time.perf_counter()
        character = self._initializer.create_character(description)
        generation_time_ms = int((time.perf_counter() - start_time) * 1000)

        # Save character (save_character assigns ID if None and saves to storage_dir)
        self._storage_dir.mkdir(parents=True, exist_ok=True)
        saved_path = CharacterInitializer.save_character(character)

        # Reload the character to get the assigned ID
        character = CharacterInitializer.load_character(saved_path)

        return CharacterCreateResponse(
            character=character,
            generation_time_ms=generation_time_ms,
        )

    def delete_character(self, character_id: str) -> bool:
        """Delete a character by ID.

        Args:
            character_id: The character's unique ID.

        Returns:
            True if deleted, False if not found.
        """
        path = self._storage_dir / f"{character_id}.json"
        if not path.exists():
            return False
        path.unlink()
        return True


# Singleton instance for dependency injection
_service_instance: CharacterService | None = None


def get_character_service() -> CharacterService:
    """Get the character service instance.

    Returns:
        The singleton CharacterService instance.
    """
    global _service_instance
    if _service_instance is None:
        _service_instance = CharacterService()
    return _service_instance
