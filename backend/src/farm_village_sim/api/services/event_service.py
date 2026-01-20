"""Event service for business logic."""

import time
from pathlib import Path

from pydantic import BaseModel

from farm_village_sim.characters.initializer import (
    DEFAULT_CHARACTERS_DIR,
    CharacterInitializer,
)
from farm_village_sim.characters.models import Character
from farm_village_sim.events.graph import EventGraphBuilder, EventState
from farm_village_sim.events.models import (
    CharacterMood,
    EventConfig,
    EventResult,
    EventType,
)
from farm_village_sim.llm.providers import LLMProvider, get_provider

# Default directory for event storage
DEFAULT_EVENTS_DIR = Path("data/events")


class EventCreateRequest(BaseModel):
    """Request model for event creation."""

    character_a_id: str
    character_b_id: str
    event_type: EventType
    description: str
    location: str
    min_interactions: int = 3
    max_interactions: int = 6
    character_a_mood: CharacterMood = CharacterMood.NEUTRAL
    character_b_mood: CharacterMood = CharacterMood.NEUTRAL
    character_a_target_mood: CharacterMood | None = None
    character_b_target_mood: CharacterMood | None = None
    language: str = "spanish"


class EventCreateResponse(BaseModel):
    """Response model for event creation."""

    event: EventResult
    generation_time_ms: int


class EventService:
    """Service for event CRUD operations."""

    def __init__(
        self,
        provider: LLMProvider | None = None,
        events_dir: Path | None = None,
        characters_dir: Path | None = None,
    ) -> None:
        """Initialize the event service.

        Args:
            provider: LLM provider for event generation. If None, uses default.
            events_dir: Directory for event storage. If None, uses default.
            characters_dir: Directory for character storage. If None, uses default.
        """
        self._provider = provider
        self._events_dir = events_dir or DEFAULT_EVENTS_DIR
        self._characters_dir = characters_dir or DEFAULT_CHARACTERS_DIR

    def _get_provider(self) -> LLMProvider:
        """Get or create the LLM provider lazily.

        Returns:
            The LLMProvider instance.

        Raises:
            ValueError: If no API key is configured.
        """
        if self._provider is None:
            self._provider = get_provider("openai")
        return self._provider

    def _load_character(self, character_id: str) -> Character | None:
        """Load a character by ID.

        Args:
            character_id: The character's unique ID.

        Returns:
            The character if found, None otherwise.
        """
        path = self._characters_dir / f"{character_id}.json"
        if not path.exists():
            return None
        return CharacterInitializer.load_character(path)

    def list_events(self, character_id: str | None = None) -> list[EventResult]:
        """List all saved events, optionally filtered by character.

        Args:
            character_id: Optional character ID to filter events by participant.

        Returns:
            List of events in storage.
        """
        if not self._events_dir.exists():
            return []

        events = []
        for json_file in self._events_dir.glob("*.json"):
            try:
                event = EventResult.model_validate_json(json_file.read_text())
                # Filter by character if specified
                if character_id:
                    if (
                        event.config.character_a_id == character_id
                        or event.config.character_b_id == character_id
                    ):
                        events.append(event)
                else:
                    events.append(event)
            except Exception:
                # Skip invalid files
                continue

        # Sort by generated_at descending (most recent first)
        events.sort(key=lambda e: e.generated_at, reverse=True)
        return events

    def get_event(self, event_id: str) -> EventResult | None:
        """Get an event by ID.

        Args:
            event_id: The event's unique ID.

        Returns:
            The event if found, None otherwise.
        """
        path = self._events_dir / f"{event_id}.json"
        if not path.exists():
            return None
        return EventResult.model_validate_json(path.read_text())

    def create_event(self, request: EventCreateRequest) -> EventCreateResponse:
        """Create a new event using LLM generation.

        Args:
            request: Event creation request.

        Returns:
            Response containing the generated event and timing info.

        Raises:
            ValueError: If characters are not found.
        """
        # Load characters
        character_a = self._load_character(request.character_a_id)
        character_b = self._load_character(request.character_b_id)

        if character_a is None:
            raise ValueError(f"Character A not found: {request.character_a_id}")
        if character_b is None:
            raise ValueError(f"Character B not found: {request.character_b_id}")

        # Create event config
        config = EventConfig(
            description=request.description,
            event_type=request.event_type,
            location=request.location,
            min_interactions=request.min_interactions,
            max_interactions=request.max_interactions,
            character_a_id=request.character_a_id,
            character_b_id=request.character_b_id,
            character_a_mood=request.character_a_mood,
            character_b_mood=request.character_b_mood,
            character_a_target_mood=request.character_a_target_mood,
            character_b_target_mood=request.character_b_target_mood,
            language=request.language,
        )

        # Build and run the graph
        start_time = time.perf_counter()

        builder = EventGraphBuilder(self._get_provider())
        graph = builder.build()
        compiled_graph = graph.compile()

        # Create initial state
        initial_state = EventState(
            config=config,
            character_a=character_a,
            character_b=character_b,
            character_a_mood=request.character_a_mood,
            character_b_mood=request.character_b_mood,
        )

        # Run the graph
        final_state_dict = compiled_graph.invoke(initial_state)
        final_state = (
            EventState(**final_state_dict)
            if isinstance(final_state_dict, dict)
            else final_state_dict
        )

        # Generate summary
        summary = builder.generate_summary(final_state)
        transcript = builder.create_transcript(final_state, summary)

        generation_time_ms = int((time.perf_counter() - start_time) * 1000)

        # Create result
        event_result = EventResult(
            config=config,
            transcript=transcript,
            generation_time_ms=generation_time_ms,
        )

        # Save to disk
        self._events_dir.mkdir(parents=True, exist_ok=True)
        output_path = self._events_dir / f"{event_result.id}.json"
        output_path.write_text(event_result.model_dump_json(indent=2))

        return EventCreateResponse(
            event=event_result,
            generation_time_ms=generation_time_ms,
        )

    def delete_event(self, event_id: str) -> bool:
        """Delete an event by ID.

        Args:
            event_id: The event's unique ID.

        Returns:
            True if deleted, False if not found.
        """
        path = self._events_dir / f"{event_id}.json"
        if not path.exists():
            return False
        path.unlink()
        return True


# Singleton instance for dependency injection
_service_instance: EventService | None = None


def get_event_service() -> EventService:
    """Get the event service instance.

    Returns:
        The singleton EventService instance.
    """
    global _service_instance
    if _service_instance is None:
        _service_instance = EventService()
    return _service_instance
