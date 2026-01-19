"""Event API router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from farm_village_sim.api.services.event_service import (
    EventCreateRequest,
    EventCreateResponse,
    EventService,
    get_event_service,
)
from farm_village_sim.events.models import EventResult

router = APIRouter()

# Type alias for dependency injection
ServiceDep = Annotated[EventService, Depends(get_event_service)]


@router.get("", response_model=list[EventResult])
async def list_events(
    service: ServiceDep,
    character_id: Annotated[
        str | None,
        Query(description="Filter events by character ID (as participant)"),
    ] = None,
) -> list[EventResult]:
    """List all events, optionally filtered by character."""
    return service.list_events(character_id)


@router.get("/{event_id}", response_model=EventResult)
async def get_event(event_id: str, service: ServiceDep) -> EventResult:
    """Get a specific event by ID."""
    event = service.get_event(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("", response_model=EventCreateResponse)
async def create_event(
    request: EventCreateRequest,
    service: ServiceDep,
) -> EventCreateResponse:
    """Create a new event using LLM generation.

    The event will be generated based on the two characters and configuration.
    This may take 30-60 seconds depending on the number of interactions.
    """
    try:
        return service.create_event(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Event generation failed: {e}",
        ) from e


@router.delete("/{event_id}")
async def delete_event(event_id: str, service: ServiceDep) -> dict[str, str]:
    """Delete an event by ID."""
    if not service.delete_event(event_id):
        raise HTTPException(status_code=404, detail="Event not found")
    return {"status": "deleted", "id": event_id}
