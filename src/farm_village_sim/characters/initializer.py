"""Character initialization using LLM-powered generation."""

from langchain_core.messages import HumanMessage, SystemMessage

from farm_village_sim.characters.models import Character
from farm_village_sim.characters.prompts import (
    CHARACTER_SYSTEM_PROMPT,
    CHARACTER_USER_PROMPT_TEMPLATE,
)
from farm_village_sim.llm.providers import LLMProvider


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
