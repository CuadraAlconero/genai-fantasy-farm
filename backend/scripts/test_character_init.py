#!/usr/bin/env python
"""Test script for character initialization."""

from typing import Annotated

import typer
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from farm_village_sim.characters import Character, CharacterInitializer
from farm_village_sim.llm import (
    LLMSettings,
    ProviderName,
    ReasoningEffort,
    get_provider,
)

app = typer.Typer(help="Test the character initialization system.")
console = Console()


def display_character(character: Character) -> None:
    """Display a character using rich formatting."""
    # Header with name and basic info
    header = Text()
    header.append(f"{character.name}", style="bold cyan")
    header.append(f" ({character.age} years old, {character.gender.value})")

    console.print(Panel(header, title="Character", border_style="cyan"))

    # Appearance
    appearance_table = Table(
        title="Appearance", show_header=False, border_style="green"
    )
    appearance_table.add_column("Attribute", style="dim")
    appearance_table.add_column("Value")

    appearance_table.add_row("Height", f"{character.appearance.height_cm} cm")
    appearance_table.add_row("Build", character.appearance.build.value)
    appearance_table.add_row(
        "Hair", f"{character.appearance.hair_color}, {character.appearance.hair_style}"
    )
    appearance_table.add_row("Eyes", character.appearance.eye_color)
    appearance_table.add_row("Skin", character.appearance.skin_tone)
    appearance_table.add_row("Clothing", character.appearance.clothing_style)
    if character.appearance.distinguishing_features:
        appearance_table.add_row(
            "Features", ", ".join(character.appearance.distinguishing_features)
        )

    console.print(appearance_table)
    console.print()

    # Personality
    personality_table = Table(
        title="Personality", show_header=False, border_style="yellow"
    )
    personality_table.add_column("Attribute", style="dim")
    personality_table.add_column("Value")

    personality_table.add_row("Temperament", character.personality.temperament.value)
    personality_table.add_row(
        "Positive Traits", ", ".join(character.personality.positive_traits)
    )
    personality_table.add_row(
        "Negative Traits", ", ".join(character.personality.negative_traits)
    )
    personality_table.add_row("Values", ", ".join(character.personality.values))
    if character.personality.quirks:
        personality_table.add_row("Quirks", ", ".join(character.personality.quirks))
    if character.personality.fears:
        personality_table.add_row("Fears", ", ".join(character.personality.fears))

    console.print(personality_table)
    console.print()

    # Skills & Stats
    skills_table = Table(
        title="Skills & Abilities", show_header=False, border_style="blue"
    )
    skills_table.add_column("Attribute", style="dim")
    skills_table.add_column("Value")

    skills_table.add_row("Occupation", character.skills.occupation)
    skills_table.add_row("Primary Skills", ", ".join(character.skills.primary_skills))
    if character.skills.secondary_skills:
        skills_table.add_row(
            "Secondary Skills", ", ".join(character.skills.secondary_skills)
        )
    if character.skills.special_talent:
        skills_table.add_row("Special Talent", character.skills.special_talent)

    console.print(skills_table)
    console.print()

    # Stats
    stats = character.skills.stats
    stats_table = Table(title="Stats", border_style="magenta")
    stats_table.add_column("STR", justify="center")
    stats_table.add_column("DEX", justify="center")
    stats_table.add_column("CON", justify="center")
    stats_table.add_column("INT", justify="center")
    stats_table.add_column("WIS", justify="center")
    stats_table.add_column("CHA", justify="center")

    stats_table.add_row(
        str(stats.strength),
        str(stats.dexterity),
        str(stats.constitution),
        str(stats.intelligence),
        str(stats.wisdom),
        str(stats.charisma),
    )

    console.print(stats_table)
    console.print()

    # Backstory
    backstory_table = Table(title="Backstory", show_header=False, border_style="red")
    backstory_table.add_column("Attribute", style="dim")
    backstory_table.add_column("Value")

    backstory_table.add_row("Origin", character.backstory.origin_village)
    backstory_table.add_row("Family", character.backstory.family_status)
    backstory_table.add_row("Parents", character.backstory.parents_occupation)
    backstory_table.add_row(
        "Reason for Arrival", character.backstory.reason_for_arrival
    )

    if character.backstory.life_events:
        events = "\n".join(
            f"Age {e.age_at_event}: {e.description}"
            for e in character.backstory.life_events
        )
        backstory_table.add_row("Life Events", events)

    if character.backstory.secrets:
        backstory_table.add_row("Secrets", ", ".join(character.backstory.secrets))

    console.print(backstory_table)
    console.print()

    # Portrait description
    console.print(
        Panel(
            character.portrait_description,
            title="Portrait Description",
            border_style="cyan",
        )
    )


@app.command()
def generate(
    provider: Annotated[
        ProviderName,
        typer.Option("--provider", "-p", help="LLM provider to use"),
    ] = "openai",
    model: Annotated[
        str | None,
        typer.Option(
            "--model", "-m", help="Model name (overrides default from settings)"
        ),
    ] = None,
    reasoning: Annotated[
        ReasoningEffort | None,
        typer.Option("--reasoning", "-r", help="Reasoning effort level"),
    ] = None,
    description: Annotated[
        str | None,
        typer.Option("--description", "-d", help="Optional character description"),
    ] = None,
    output_json: Annotated[
        bool,
        typer.Option("--json", "-j", help="Output raw JSON instead of formatted"),
    ] = False,
) -> None:
    """Generate a new character using the specified LLM provider."""
    # Get default model from settings if not specified
    settings = LLMSettings()
    effective_model = model or (
        settings.openai_model if provider == "openai" else settings.gemini_model
    )
    effective_reasoning = reasoning or (
        settings.openai_reasoning_effort
        if provider == "openai"
        else settings.gemini_reasoning_effort
    )

    console.print(f"[dim]Provider: {provider}[/dim]")
    console.print(f"[dim]Model: {effective_model}[/dim]")
    console.print(f"[dim]Reasoning effort: {effective_reasoning}[/dim]")

    if description:
        console.print(f"[dim]Character concept: {description}[/dim]")
    else:
        console.print("[dim]Generating random character...[/dim]")

    console.print()

    with console.status("[bold green]Generating character..."):
        try:
            llm_provider = get_provider(
                provider, model=model, reasoning_effort=reasoning
            )
            initializer = CharacterInitializer(llm_provider)
            character = initializer.create_character(description)
        except ValueError as e:
            console.print(f"[red]Error:[/red] {e}")
            raise typer.Exit(1) from e
        except Exception as e:
            console.print(f"[red]Generation failed:[/red] {e}")
            raise typer.Exit(1) from e

    if output_json:
        console.print(character.model_dump_json(indent=2))
    else:
        display_character(character)

    console.print("[green]Character generated successfully![/green]")


if __name__ == "__main__":
    app()
