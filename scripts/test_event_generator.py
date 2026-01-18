#!/usr/bin/env python3
"""Test script for the event generation system."""

import time
from pathlib import Path
from typing import Annotated

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from farm_village_sim.characters.initializer import CharacterInitializer
from farm_village_sim.events.graph import EventGraphBuilder, EventState
from farm_village_sim.events.models import (
    CharacterMood,
    EventConfig,
    EventResult,
    EventType,
)
from farm_village_sim.llm.providers import (
    LLMSettings,
    ProviderName,
    ReasoningEffort,
    get_provider,
)

app = typer.Typer(help="Test the event generation system")
console = Console()

# Default paths
DEFAULT_CHARACTERS_DIR = Path("data/characters")
DEFAULT_EVENTS_DIR = Path("data/events")


def list_available_characters() -> list[Path]:
    """List all available character JSON files."""
    if not DEFAULT_CHARACTERS_DIR.exists():
        return []
    return list(DEFAULT_CHARACTERS_DIR.glob("*.json"))


def display_event_result(result: EventResult) -> None:
    """Display the event result in a formatted way."""
    # Header
    console.print()
    console.print(
        Panel(
            f"[bold]{result.config.event_type.value.upper()}[/bold]\n"
            f"{result.config.description}\n"
            f"[dim]Location: {result.config.location}[/dim]",
            title="📜 Event Generated",
            border_style="green",
        )
    )

    # Transcript
    console.print("\n[bold]Transcript:[/bold]")
    for turn in result.transcript.turns:
        mood_emoji = {
            CharacterMood.ANGRY: "😠",
            CharacterMood.SCARED: "😨",
            CharacterMood.IN_LOVE: "😍",
            CharacterMood.HAPPY: "😊",
            CharacterMood.SAD: "😢",
            CharacterMood.NERVOUS: "😰",
            CharacterMood.CONFIDENT: "😎",
            CharacterMood.SUSPICIOUS: "🤨",
            CharacterMood.GRATEFUL: "🙏",
            CharacterMood.JEALOUS: "😒",
            CharacterMood.NEUTRAL: "😐",
        }.get(turn.mood, "😐")

        console.print(
            f"\n[bold cyan]Turn {turn.turn_number}[/bold cyan] - {turn.speaker_name} {mood_emoji}"
        )
        if turn.dialogue:
            console.print(f'  💬 "{turn.dialogue}"')
        if turn.action:
            console.print(f"  🎭 *{turn.action}*")

    # Summary
    console.print()
    console.print(
        Panel(
            f"[bold]Summary:[/bold] {result.transcript.summary}\n\n"
            f"[bold]Outcome:[/bold] {result.transcript.outcome}",
            title="📋 Event Summary",
            border_style="blue",
        )
    )

    # Stats
    stats_table = Table(title="Generation Stats")
    stats_table.add_column("Metric", style="cyan")
    stats_table.add_column("Value", style="green")
    stats_table.add_row("Event ID", result.id)
    stats_table.add_row("Total Turns", str(len(result.transcript.turns)))
    stats_table.add_row("Generation Time", f"{result.generation_time_ms / 1000:.2f}s")
    stats_table.add_row(
        "Final Moods",
        f"A: {result.transcript.character_a_final_mood.value}, B: {result.transcript.character_b_final_mood.value}",
    )
    console.print(stats_table)


@app.command()
def generate(
    char_a: Annotated[
        Path,
        typer.Option(
            "--char-a",
            "-a",
            help="Path to character A JSON file",
        ),
    ],
    char_b: Annotated[
        Path,
        typer.Option(
            "--char-b",
            "-b",
            help="Path to character B JSON file",
        ),
    ],
    event_type: Annotated[
        EventType,
        typer.Option(
            "--type",
            "-t",
            help="Type of event",
        ),
    ] = EventType.ARGUMENT,
    description: Annotated[
        str,
        typer.Option(
            "--description",
            "-d",
            help="Description of the event",
        ),
    ] = "A chance encounter in the village",
    location: Annotated[
        str,
        typer.Option(
            "--location",
            "-l",
            help="Where the event takes place",
        ),
    ] = "village square",
    min_interactions: Annotated[
        int,
        typer.Option(
            "--min",
            help="Minimum number of interactions",
        ),
    ] = 3,
    max_interactions: Annotated[
        int,
        typer.Option(
            "--max",
            help="Maximum number of interactions",
        ),
    ] = 6,
    mood_a: Annotated[
        CharacterMood,
        typer.Option(
            "--mood-a",
            help="Initial mood of character A",
        ),
    ] = CharacterMood.NEUTRAL,
    mood_b: Annotated[
        CharacterMood,
        typer.Option(
            "--mood-b",
            help="Initial mood of character B",
        ),
    ] = CharacterMood.NEUTRAL,
    target_mood_a: Annotated[
        CharacterMood | None,
        typer.Option(
            "--target-a",
            help="Target final mood for character A (controls narrative arc)",
        ),
    ] = None,
    target_mood_b: Annotated[
        CharacterMood | None,
        typer.Option(
            "--target-b",
            help="Target final mood for character B (controls narrative arc)",
        ),
    ] = None,
    language: Annotated[
        str,
        typer.Option(
            "--language",
            "--lang",
            help="Language for generated dialogue and actions",
        ),
    ] = "spanish",
    provider: Annotated[
        ProviderName,
        typer.Option(
            "--provider",
            "-p",
            help="LLM provider to use",
        ),
    ] = "openai",
    model: Annotated[
        str | None,
        typer.Option(
            "--model",
            "-m",
            help="Model name (overrides default)",
        ),
    ] = None,
    reasoning: Annotated[
        ReasoningEffort | None,
        typer.Option(
            "--reasoning",
            "-r",
            help="Reasoning effort level",
        ),
    ] = None,
    output_json: Annotated[
        bool,
        typer.Option(
            "--json",
            "-j",
            help="Output raw JSON instead of formatted",
        ),
    ] = False,
    no_save: Annotated[
        bool,
        typer.Option(
            "--no-save",
            help="Don't save the event to disk",
        ),
    ] = False,
) -> None:
    """Generate an event between two characters."""
    # Validate paths
    if not char_a.exists():
        console.print(f"[red]Error:[/red] Character A file not found: {char_a}")
        raise typer.Exit(1)
    if not char_b.exists():
        console.print(f"[red]Error:[/red] Character B file not found: {char_b}")
        raise typer.Exit(1)

    # Load characters
    console.print("[dim]Loading characters...[/dim]")
    character_a = CharacterInitializer.load_character(char_a)
    character_b = CharacterInitializer.load_character(char_b)

    console.print(
        f"[dim]Character A: {character_a.name} ({character_a.skills.occupation})[/dim]"
    )
    console.print(
        f"[dim]Character B: {character_b.name} ({character_b.skills.occupation})[/dim]"
    )

    # Show provider info
    settings = LLMSettings()
    effective_model = model or (
        settings.openai_model if provider == "openai" else settings.gemini_model
    )
    effective_reasoning = reasoning or (
        settings.openai_reasoning_effort
        if provider == "openai"
        else settings.gemini_reasoning_effort
    )
    console.print(
        f"[dim]Provider: {provider}, Model: {effective_model}, Reasoning: {effective_reasoning}[/dim]"
    )

    # Create event config
    config = EventConfig(
        description=description,
        event_type=event_type,
        location=location,
        min_interactions=min_interactions,
        max_interactions=max_interactions,
        character_a_id=character_a.id or "",
        character_b_id=character_b.id or "",
        character_a_mood=mood_a,
        character_b_mood=mood_b,
        character_a_target_mood=target_mood_a,
        character_b_target_mood=target_mood_b,
        language=language,
    )

    console.print(f"[dim]Language: {language}[/dim]")

    # Show target moods if set
    if target_mood_a or target_mood_b:
        console.print("[dim]Target moods:[/dim]")
        if target_mood_a:
            console.print(f"[dim]  Character A → {target_mood_a.value}[/dim]")
        if target_mood_b:
            console.print(f"[dim]  Character B → {target_mood_b.value}[/dim]")

    # Build and run the graph
    console.print()
    with console.status("[bold green]Generating event..."):
        start_time = time.perf_counter()

        try:
            # Get LLM provider
            llm_provider = get_provider(
                provider, model=model, reasoning_effort=reasoning
            )

            # Build the graph
            builder = EventGraphBuilder(llm_provider)
            graph = builder.build()
            compiled_graph = graph.compile()

            # Create initial state
            initial_state = EventState(
                config=config,
                character_a=character_a,
                character_b=character_b,
                character_a_mood=mood_a,
                character_b_mood=mood_b,
            )

            # Run the graph
            final_state = None
            for state in compiled_graph.stream(initial_state):
                # Get the latest state from the stream
                for node_output in state.values():
                    if isinstance(node_output, dict) and "current_turn" in node_output:
                        console.print(
                            f"[dim]  Turn {node_output['current_turn']} completed[/dim]"
                        )

            # Get final state
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

        except Exception as e:
            console.print(f"[red]Error during generation:[/red] {e}")
            raise typer.Exit(1) from e

    # Create result
    result = EventResult(
        config=config,
        transcript=transcript,
        generation_time_ms=generation_time_ms,
    )

    # Output
    if output_json:
        console.print(result.model_dump_json(indent=2))
    else:
        display_event_result(result)

    # Save to disk
    if not no_save:
        DEFAULT_EVENTS_DIR.mkdir(parents=True, exist_ok=True)
        output_path = DEFAULT_EVENTS_DIR / f"{result.id}.json"
        output_path.write_text(result.model_dump_json(indent=2))
        console.print(f"\n[green]✓ Event saved to:[/green] {output_path}")


@app.command()
def list_characters() -> None:
    """List available characters for event generation."""
    characters = list_available_characters()

    if not characters:
        console.print("[yellow]No characters found in data/characters/[/yellow]")
        console.print(
            "Generate characters first using: uv run python scripts/test_character_init.py"
        )
        return

    table = Table(title="Available Characters")
    table.add_column("ID", style="cyan")
    table.add_column("Name", style="green")
    table.add_column("Occupation", style="yellow")
    table.add_column("File", style="dim")

    for path in characters:
        try:
            character = CharacterInitializer.load_character(path)
            table.add_row(
                character.id or "N/A",
                character.name,
                character.skills.occupation,
                path.name,
            )
        except Exception as e:
            table.add_row("Error", str(e), "", path.name)

    console.print(table)


if __name__ == "__main__":
    app()
