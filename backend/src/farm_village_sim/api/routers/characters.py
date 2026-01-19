"""Character API router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from farm_village_sim.api.services.character_service import (
    CharacterCreateRequest,
    CharacterCreateResponse,
    CharacterService,
    get_character_service,
)
from farm_village_sim.characters.models import Character

router = APIRouter()

# Type alias for dependency injection
ServiceDep = Annotated[CharacterService, Depends(get_character_service)]


@router.get("", response_model=list[Character])
async def list_characters(service: ServiceDep) -> list[Character]:
    """List all characters in the village."""
    return service.list_characters()


@router.get("/{character_id}", response_model=Character)
async def get_character(character_id: str, service: ServiceDep) -> Character:
    """Get a specific character by ID."""
    character = service.get_character(character_id)
    if character is None:
        raise HTTPException(status_code=404, detail="Character not found")
    return character


@router.post("", response_model=CharacterCreateResponse)
async def create_character(
    request: CharacterCreateRequest,
    service: ServiceDep,
) -> CharacterCreateResponse:
    """Create a new character using LLM generation.

    The character will be generated based on the provided description and hints.
    This may take several seconds depending on the LLM provider.
    """
    try:
        return service.create_character(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Character generation failed: {e}",
        ) from e


@router.delete("/{character_id}")
async def delete_character(character_id: str, service: ServiceDep) -> dict[str, str]:
    """Delete a character by ID."""
    if not service.delete_character(character_id):
        raise HTTPException(status_code=404, detail="Character not found")
    return {"status": "deleted", "id": character_id}
