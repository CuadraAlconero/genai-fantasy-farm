"""Character system - NPCs, player, relationships, and dialogue."""

from farm_village_sim.characters.initializer import CharacterInitializer
from farm_village_sim.characters.models import (
    TEMPERAMENT_DESCRIPTIONS,
    Appearance,
    Backstory,
    Build,
    Character,
    Gender,
    LifeEvent,
    Personality,
    Skills,
    StatBlock,
    Temperament,
)
from farm_village_sim.characters.prompts import (
    CHARACTER_SYSTEM_PROMPT,
    CHARACTER_USER_PROMPT_TEMPLATE,
)

__all__ = [
    "CHARACTER_SYSTEM_PROMPT",
    "CHARACTER_USER_PROMPT_TEMPLATE",
    "TEMPERAMENT_DESCRIPTIONS",
    "Appearance",
    "Backstory",
    "Build",
    "Character",
    "CharacterInitializer",
    "Gender",
    "LifeEvent",
    "Personality",
    "Skills",
    "StatBlock",
    "Temperament",
]
