"""LangGraph-based event generation system."""

from typing import Annotated, Literal

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field

from farm_village_sim.characters.models import Character
from farm_village_sim.events.models import (
    CharacterMood,
    EventConfig,
    EventTranscript,
    EventTurn,
)
from farm_village_sim.events.prompts import (
    CHARACTER_TURN_PROMPT,
    EVENT_SUMMARY_PROMPT,
    EVENT_SYSTEM_PROMPT,
    SUPERVISOR_PROMPT,
)
from farm_village_sim.llm.providers import LLMProvider


class CharacterResponse(BaseModel):
    """Structured response from a character node."""

    dialogue: str | None = Field(
        default=None,
        description="What the character says (can be None if only acting)",
    )
    action: str | None = Field(
        default=None,
        description="Physical action or gesture (can be None if only speaking)",
    )


class SupervisorDecision(BaseModel):
    """Structured decision from the supervisor node."""

    should_continue: bool = Field(
        ...,
        description="Whether the event should continue",
    )
    next_speaker: Literal["character_a", "character_b"] = Field(
        default="character_a",
        description="Which character should speak next (if continuing)",
    )
    character_a_mood: CharacterMood = Field(
        ...,
        description="Updated mood for character A",
    )
    character_b_mood: CharacterMood = Field(
        ...,
        description="Updated mood for character B",
    )
    end_reason: str | None = Field(
        default=None,
        description="Reason for ending the event (if ending)",
    )


class EventSummary(BaseModel):
    """Structured summary of the event."""

    summary: str = Field(
        ...,
        description="Brief 2-3 sentence summary of what happened",
    )
    outcome: str = Field(
        ...,
        description="The outcome or resolution of the event",
    )


class EventState(BaseModel):
    """State for the event graph."""

    # Configuration
    config: EventConfig
    character_a: Character
    character_b: Character

    # Current state
    current_turn: int = 0
    current_speaker: Literal["character_a", "character_b"] = "character_a"
    character_a_mood: CharacterMood = CharacterMood.NEUTRAL
    character_b_mood: CharacterMood = CharacterMood.NEUTRAL

    # Transcript accumulator
    turns: list[EventTurn] = Field(default_factory=list)

    # Control flow
    should_end: bool = False

    # Messages for LangGraph (using Annotated for proper message handling)
    messages: Annotated[list, add_messages] = Field(default_factory=list)


def _format_conversation_history(turns: list[EventTurn]) -> str:
    """Format the conversation history for prompts."""
    if not turns:
        return "(No conversation yet - this is the first turn)"

    lines = []
    for turn in turns:
        speaker = turn.speaker_name
        parts = []
        if turn.dialogue:
            parts.append(f'"{turn.dialogue}"')
        if turn.action:
            parts.append(f"*{turn.action}*")
        content = " ".join(parts) if parts else "(no response)"
        lines.append(
            f"Turn {turn.turn_number} - {speaker} ({turn.mood.value}): {content}"
        )

    return "\n".join(lines)


def _get_remaining_interactions(state: EventState) -> int:
    """Calculate remaining interactions before event can end."""
    return max(0, state.config.min_interactions - state.current_turn)


class EventGraphBuilder:
    """Builder for the event generation LangGraph."""

    def __init__(self, provider: LLMProvider) -> None:
        """Initialize the event graph builder.

        Args:
            provider: LLM provider for generating responses.
        """
        self._provider = provider
        self._model = provider.get_model()

    def _character_a_node(self, state: EventState) -> dict:
        """Node for character A's turn."""
        return self._character_node(state, "a")

    def _character_b_node(self, state: EventState) -> dict:
        """Node for character B's turn."""
        return self._character_node(state, "b")

    def _character_node(self, state: EventState, which: Literal["a", "b"]) -> dict:
        """Generate a character's response."""
        if which == "a":
            character = state.character_a
            other_character = state.character_b
            current_mood = state.character_a_mood
            other_mood = state.character_b_mood
        else:
            character = state.character_b
            other_character = state.character_a
            current_mood = state.character_b_mood
            other_mood = state.character_a_mood

        # Build the prompt
        prompt = CHARACTER_TURN_PROMPT.format(
            character_name=character.name,
            occupation=character.skills.occupation,
            age=character.age,
            temperament=character.personality.temperament.value,
            positive_traits=", ".join(character.personality.positive_traits),
            negative_traits=", ".join(character.personality.negative_traits),
            values=", ".join(character.personality.values),
            event_type=state.config.event_type.value,
            event_description=state.config.description,
            location=state.config.location,
            current_mood=current_mood.value,
            other_character_name=other_character.name,
            other_occupation=other_character.skills.occupation,
            other_mood=other_mood.value,
            conversation_history=_format_conversation_history(state.turns),
            turn_number=state.current_turn + 1,
            remaining_interactions=_get_remaining_interactions(state),
            language=state.config.language,
        )

        # Get structured response
        structured_model = self._model.with_structured_output(CharacterResponse)
        messages = [
            SystemMessage(content=EVENT_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]
        response: CharacterResponse = structured_model.invoke(messages)

        # Create the turn
        new_turn = EventTurn(
            turn_number=state.current_turn + 1,
            speaker_id=character.id or "",
            speaker_name=character.name,
            dialogue=response.dialogue,
            action=response.action,
            mood=current_mood,
            remaining_interactions=_get_remaining_interactions(state),
        )

        # Return state updates
        return {
            "current_turn": state.current_turn + 1,
            "turns": [*state.turns, new_turn],
            "messages": [
                HumanMessage(
                    content=f"{character.name}: {response.dialogue or ''} {response.action or ''}"
                )
            ],
        }

    def _supervisor_node(self, state: EventState) -> dict:
        """Supervisor node that decides flow and updates moods."""
        # Build the prompt
        latest_turn = state.turns[-1] if state.turns else None
        latest_turn_str = ""
        if latest_turn:
            parts = []
            if latest_turn.dialogue:
                parts.append(f'Said: "{latest_turn.dialogue}"')
            if latest_turn.action:
                parts.append(f"Action: {latest_turn.action}")
            latest_turn_str = f"{latest_turn.speaker_name}: {' | '.join(parts)}"

        # Build target mood instructions
        target_mood_lines = []
        if state.config.character_a_target_mood:
            target_mood_lines.append(
                f"- Character A ({state.character_a.name}) should end up feeling "
                f"{state.config.character_a_target_mood.value}"
            )
        if state.config.character_b_target_mood:
            target_mood_lines.append(
                f"- Character B ({state.character_b.name}) should end up feeling "
                f"{state.config.character_b_target_mood.value}"
            )
        if target_mood_lines:
            target_mood_instructions = (
                "The event should guide characters toward these final moods:\n"
                + "\n".join(target_mood_lines)
                + "\nGradually shift moods in this direction as the event progresses."
            )
        else:
            target_mood_instructions = (
                "No specific target moods set - let the moods evolve naturally "
                "based on the event type and interactions."
            )

        prompt = SUPERVISOR_PROMPT.format(
            event_type=state.config.event_type.value,
            event_description=state.config.description,
            location=state.config.location,
            min_interactions=state.config.min_interactions,
            max_interactions=state.config.max_interactions,
            current_turn=state.current_turn,
            character_a_name=state.character_a.name,
            character_a_mood=state.character_a_mood.value,
            character_b_name=state.character_b.name,
            character_b_mood=state.character_b_mood.value,
            target_mood_instructions=target_mood_instructions,
            conversation_history=_format_conversation_history(
                state.turns[:-1] if state.turns else []
            ),
            latest_turn=latest_turn_str,
        )

        # Get structured decision
        structured_model = self._model.with_structured_output(SupervisorDecision)
        messages = [
            SystemMessage(
                content="You are a narrative supervisor for a fantasy village simulation."
            ),
            HumanMessage(content=prompt),
        ]
        decision: SupervisorDecision = structured_model.invoke(messages)

        # Force continuation if below minimum
        should_end = not decision.should_continue
        if state.current_turn < state.config.min_interactions:
            should_end = False

        # Force end if at maximum
        if state.current_turn >= state.config.max_interactions:
            should_end = True

        # Determine final moods - use target moods if ending and targets are set
        final_a_mood = decision.character_a_mood
        final_b_mood = decision.character_b_mood

        if should_end:
            # Override with target moods if specified
            if state.config.character_a_target_mood:
                final_a_mood = state.config.character_a_target_mood
            if state.config.character_b_target_mood:
                final_b_mood = state.config.character_b_target_mood

        return {
            "should_end": should_end,
            "current_speaker": decision.next_speaker,
            "character_a_mood": final_a_mood,
            "character_b_mood": final_b_mood,
        }

    def _should_continue(
        self, state: EventState
    ) -> Literal["character_a", "character_b", "end"]:
        """Determine the next node based on state."""
        if state.should_end:
            return "end"
        return state.current_speaker

    def build(self) -> StateGraph:
        """Build and return the event graph."""
        # Create the graph with our state schema
        graph = StateGraph(EventState)

        # Add nodes
        graph.add_node("character_a", self._character_a_node)
        graph.add_node("character_b", self._character_b_node)
        graph.add_node("supervisor", self._supervisor_node)

        # Set entry point - supervisor decides who starts
        graph.set_entry_point("supervisor")

        # Add edges from character nodes to supervisor
        graph.add_edge("character_a", "supervisor")
        graph.add_edge("character_b", "supervisor")

        # Add conditional edge from supervisor
        graph.add_conditional_edges(
            "supervisor",
            self._should_continue,
            {
                "character_a": "character_a",
                "character_b": "character_b",
                "end": END,
            },
        )

        return graph

    def generate_summary(self, state: EventState) -> EventSummary:
        """Generate a summary of the completed event."""
        # Format transcript
        transcript_lines = []
        for turn in state.turns:
            parts = []
            if turn.dialogue:
                parts.append(f'"{turn.dialogue}"')
            if turn.action:
                parts.append(f"*{turn.action}*")
            content = " ".join(parts) if parts else "(no response)"
            transcript_lines.append(f"{turn.speaker_name}: {content}")

        prompt = EVENT_SUMMARY_PROMPT.format(
            event_type=state.config.event_type.value,
            location=state.config.location,
            event_description=state.config.description,
            character_a_name=state.character_a.name,
            character_a_initial_mood=state.config.character_a_mood.value,
            character_a_final_mood=state.character_a_mood.value,
            character_b_name=state.character_b.name,
            character_b_initial_mood=state.config.character_b_mood.value,
            character_b_final_mood=state.character_b_mood.value,
            transcript="\n".join(transcript_lines),
            language=state.config.language,
        )

        structured_model = self._model.with_structured_output(EventSummary)
        messages = [
            SystemMessage(
                content="You are a narrative summarizer for a fantasy village simulation."
            ),
            HumanMessage(content=prompt),
        ]
        return structured_model.invoke(messages)

    def create_transcript(
        self, state: EventState, summary: EventSummary
    ) -> EventTranscript:
        """Create the final event transcript from state and summary."""
        return EventTranscript(
            turns=state.turns,
            summary=summary.summary,
            outcome=summary.outcome,
            character_a_final_mood=state.character_a_mood,
            character_b_final_mood=state.character_b_mood,
        )
