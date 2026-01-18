"""Pydantic models for character data representation."""

from enum import Enum

from pydantic import BaseModel, Field


class Gender(str, Enum):
    """Character gender options."""

    MALE = "male"
    FEMALE = "female"


class Build(str, Enum):
    """Character body build types."""

    SLIM = "slim"
    AVERAGE = "average"
    ATHLETIC = "athletic"
    STOCKY = "stocky"
    HEAVY = "heavy"


class Temperament(str, Enum):
    """Character temperament types based on the four classical temperaments."""

    CHOLERIC = "choleric"
    SANGUINE = "sanguine"
    MELANCHOLIC = "melancholic"
    PHLEGMATIC = "phlegmatic"


# Detailed temperament descriptions for LLM context
TEMPERAMENT_DESCRIPTIONS: dict[Temperament, str] = {
    Temperament.CHOLERIC: (
        "Choleric: Ambitious, driven, and natural leaders. They are decisive, "
        "goal-oriented, and thrive on challenges. Can be impatient, domineering, "
        "and quick to anger. Excel in leadership roles and crisis situations."
    ),
    Temperament.SANGUINE: (
        "Sanguine: Optimistic, social, and enthusiastic. They are charming, "
        "talkative, and enjoy being around people. Can be impulsive, disorganized, "
        "and struggle with follow-through. Excel in social roles and entertainment."
    ),
    Temperament.MELANCHOLIC: (
        "Melancholic: Analytical, detail-oriented, and thoughtful. They are "
        "perfectionist, loyal, and deeply emotional. Can be overly critical, "
        "pessimistic, and prone to worry. Excel in creative and scholarly pursuits."
    ),
    Temperament.PHLEGMATIC: (
        "Phlegmatic: Calm, reliable, and diplomatic. They are patient, good "
        "listeners, and avoid conflict. Can be passive, indecisive, and resistant "
        "to change. Excel in supportive roles and maintaining harmony."
    ),
}


class Appearance(BaseModel):
    """Physical appearance attributes of a character."""

    height_cm: int = Field(
        ...,
        ge=140,
        le=220,
        description="Height in centimeters, typically between 140-220",
    )
    build: Build = Field(..., description="Body build type")
    hair_color: str = Field(
        ..., description="Hair color (e.g., 'black', 'auburn', 'silver')"
    )
    hair_style: str = Field(
        ..., description="Hair style (e.g., 'long braided', 'short cropped', 'bald')"
    )
    eye_color: str = Field(
        ..., description="Eye color (e.g., 'brown', 'green', 'heterochromatic')"
    )
    skin_tone: str = Field(
        ..., description="Skin tone (e.g., 'fair', 'olive', 'dark brown')"
    )
    distinguishing_features: list[str] = Field(
        default_factory=list,
        description="Notable features like scars, tattoos, birthmarks",
    )
    clothing_style: str = Field(
        ...,
        description="Typical clothing style (e.g., 'practical farmer attire', 'colorful merchant robes')",
    )


class Personality(BaseModel):
    """Personality traits and psychological attributes."""

    temperament: Temperament = Field(
        ...,
        description=(
            "Primary temperament type. Options: "
            "choleric (ambitious, driven leaders who are decisive but can be impatient), "
            "sanguine (optimistic, social extroverts who are charming but impulsive), "
            "melancholic (analytical perfectionists who are thoughtful but prone to worry), "
            "phlegmatic (calm, reliable diplomats who are patient but can be passive)"
        ),
    )
    positive_traits: list[str] = Field(
        ...,
        min_length=2,
        max_length=5,
        description="Positive personality traits (e.g., 'kind', 'hardworking', 'honest')",
    )
    negative_traits: list[str] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="Negative personality traits or flaws (e.g., 'stubborn', 'gossip')",
    )
    quirks: list[str] = Field(
        default_factory=list,
        max_length=3,
        description="Unique behavioral quirks (e.g., 'hums while working', 'collects feathers')",
    )
    values: list[str] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="Core values (e.g., 'family', 'honor', 'freedom')",
    )
    fears: list[str] = Field(
        default_factory=list,
        max_length=2,
        description="Deep fears or phobias (e.g., 'heights', 'abandonment')",
    )


class LifeEvent(BaseModel):
    """A significant event in a character's past."""

    age_at_event: int = Field(..., ge=0, description="Age when the event occurred")
    description: str = Field(
        ..., description="Brief description of the event and its impact"
    )


class Backstory(BaseModel):
    """Character backstory and history."""

    origin_village: str = Field(
        ...,
        description="Name of the village or place where the character grew up",
    )
    family_status: str = Field(
        ...,
        description="Family situation (e.g., 'orphan', 'eldest of five siblings', 'only child')",
    )
    parents_occupation: str = Field(
        ...,
        description="What the character's parents did (e.g., 'farmers', 'traveling merchants')",
    )
    reason_for_arrival: str = Field(
        ...,
        description="Why the character came to this village (e.g., 'seeking new opportunities', 'fleeing past')",
    )
    life_events: list[LifeEvent] = Field(
        default_factory=list,
        max_length=5,
        description="Significant life events that shaped the character",
    )
    secrets: list[str] = Field(
        default_factory=list,
        max_length=2,
        description="Hidden secrets the character keeps (e.g., 'has a bounty on their head')",
    )


class StatBlock(BaseModel):
    """Character stats and abilities on a 1-10 scale."""

    strength: int = Field(..., ge=1, le=10, description="Physical strength and power")
    dexterity: int = Field(
        ..., ge=1, le=10, description="Agility who and hand-eye coordination"
    )
    constitution: int = Field(..., ge=1, le=10, description="Endurance and health")
    intelligence: int = Field(
        ..., ge=1, le=10, description="Learning ability and reasoning"
    )
    wisdom: int = Field(..., ge=1, le=10, description="Intuition and perception")
    charisma: int = Field(
        ..., ge=1, le=10, description="Social influence and likability"
    )


class Skills(BaseModel):
    """Character occupation and abilities."""

    occupation: str = Field(
        ...,
        description="Primary occupation (e.g., 'blacksmith', 'herbalist', 'farmer')",
    )
    primary_skills: list[str] = Field(
        ...,
        min_length=1,
        max_length=3,
        description="Main skills related to occupation (e.g., 'metalworking', 'plant identification')",
    )
    secondary_skills: list[str] = Field(
        default_factory=list,
        max_length=3,
        description="Additional skills (e.g., 'cooking', 'storytelling', 'animal handling')",
    )
    stats: StatBlock = Field(..., description="Character stat block")
    special_talent: str | None = Field(
        default=None,
        description="A unique talent or ability (e.g., 'perfect pitch', 'animal whisperer')",
    )


class Character(BaseModel):
    """Complete character model combining all attributes."""

    # Unique identifier (assigned when saving)
    id: str | None = Field(
        default=None,
        description="Unique identifier for the character (UUID)",
    )

    # Basic info
    name: str = Field(..., description="Character's full name")
    age: int = Field(..., ge=16, le=100, description="Character's age in years")
    gender: Gender = Field(..., description="Character's gender")

    # Composed attributes
    appearance: Appearance = Field(..., description="Physical appearance")
    personality: Personality = Field(..., description="Personality traits")
    backstory: Backstory = Field(..., description="Character history")
    skills: Skills = Field(..., description="Occupation and abilities")

    # Optional metadata
    portrait_description: str = Field(
        ...,
        description="A vivid one-paragraph description suitable for generating character art",
    )
