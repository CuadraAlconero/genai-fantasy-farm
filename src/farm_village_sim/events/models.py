"""Pydantic models for the event system."""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class EventType(str, Enum):
    """Types of events that can occur between characters."""

    ARGUMENT = "argument"
    FIGHT = "fight"
    STEALING = "stealing"
    ROMANCE = "romance"
    TRADE = "trade"
    GOSSIP = "gossip"
    HELP = "help"
    CELEBRATION = "celebration"
    CONFRONTATION = "confrontation"
    RECONCILIATION = "reconciliation"


class CharacterMood(str, Enum):
    """Mood of a character during an event."""

    ANGRY = "angry"
    SCARED = "scared"
    IN_LOVE = "in_love"
    HAPPY = "happy"
    SAD = "sad"
    NERVOUS = "nervous"
    CONFIDENT = "confident"
    SUSPICIOUS = "suspicious"
    GRATEFUL = "grateful"
    JEALOUS = "jealous"
    NEUTRAL = "neutral"


class EventConfig(BaseModel):
    """Configuration for an event between two characters."""

    description: str = Field(
        ...,
        description="A brief description of what the event is about",
    )
    event_type: EventType = Field(
        ...,
        description="The type of event occurring",
    )
    location: str = Field(
        ...,
        description="Where the event takes place (e.g., 'village square', 'tavern')",
    )
    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="When the event occurs",
    )
    min_interactions: int = Field(
        default=3,
        ge=1,
        le=20,
        description="Minimum number of interaction turns",
    )
    max_interactions: int = Field(
        default=6,
        ge=1,
        le=30,
        description="Maximum number of interaction turns",
    )
    character_a_id: str = Field(
        ...,
        description="ID of the first character",
    )
    character_b_id: str = Field(
        ...,
        description="ID of the second character",
    )
    character_a_mood: CharacterMood = Field(
        default=CharacterMood.NEUTRAL,
        description="Initial mood of character A",
    )
    character_b_mood: CharacterMood = Field(
        default=CharacterMood.NEUTRAL,
        description="Initial mood of character B",
    )
    character_a_target_mood: CharacterMood | None = Field(
        default=None,
        description="Target final mood for character A (guides the narrative arc)",
    )
    character_b_target_mood: CharacterMood | None = Field(
        default=None,
        description="Target final mood for character B (guides the narrative arc)",
    )
    language: str = Field(
        default="spanish",
        description="Language for the generated dialogue and actions",
    )


class EventTurn(BaseModel):
    """A single turn in an event interaction."""

    turn_number: int = Field(
        ...,
        ge=1,
        description="The turn number in the sequence",
    )
    speaker_id: str = Field(
        ...,
        description="ID of the character speaking/acting",
    )
    speaker_name: str = Field(
        ...,
        description="Name of the character for display",
    )
    dialogue: str | None = Field(
        default=None,
        description="What the character says (if any)",
    )
    action: str | None = Field(
        default=None,
        description="Physical action or gesture the character makes (if any)",
    )
    mood: CharacterMood = Field(
        ...,
        description="Character's mood during this turn",
    )
    remaining_interactions: int = Field(
        ...,
        ge=0,
        description="Number of interactions remaining before event can end",
    )


class EventTranscript(BaseModel):
    """Complete transcript of an event with all turns."""

    turns: list[EventTurn] = Field(
        default_factory=list,
        description="Ordered list of all turns in the event",
    )
    summary: str = Field(
        default="",
        description="Brief summary of what happened in the event",
    )
    outcome: str = Field(
        default="",
        description="The outcome or resolution of the event",
    )
    character_a_final_mood: CharacterMood = Field(
        default=CharacterMood.NEUTRAL,
        description="Character A's mood at the end of the event",
    )
    character_b_final_mood: CharacterMood = Field(
        default=CharacterMood.NEUTRAL,
        description="Character B's mood at the end of the event",
    )


class EventResult(BaseModel):
    """Complete result of an event generation, wrapping config and transcript."""

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique identifier for this event",
    )
    config: EventConfig = Field(
        ...,
        description="The configuration used to generate this event",
    )
    transcript: EventTranscript = Field(
        ...,
        description="The generated event transcript",
    )
    generated_at: datetime = Field(
        default_factory=datetime.now,
        description="When this event was generated",
    )
    generation_time_ms: int = Field(
        default=0,
        description="Time taken to generate the event in milliseconds",
    )
