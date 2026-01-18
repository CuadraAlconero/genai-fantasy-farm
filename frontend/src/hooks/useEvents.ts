import { useState, useEffect, useCallback } from 'react';
import type {
  EventResult,
  EventCreateRequest,
  EventCreateResponse,
} from '../types/event';

const API_BASE = 'http://localhost:8000/api';

export function useEvents(characterId?: string) {
  const [events, setEvents] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = characterId
        ? `${API_BASE}/events?character_id=${characterId}`
        : `${API_BASE}/events`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        setError(`Failed to fetch events: ${response.statusText}`);
        setEvents([]);
      }
    } catch {
      setError('Failed to connect to API. Is the server running?');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

export function useEvent(id: string | undefined) {
  const [event, setEvent] = useState<EventResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function loadEvent() {
      try {
        const response = await fetch(`${API_BASE}/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEvent(data);
        } else {
          setError('Event not found');
        }
      } catch {
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [id]);

  return { event, loading, error };
}

export interface UseCreateEventResult {
  createEvent: (request: EventCreateRequest) => Promise<EventCreateResponse>;
  isLoading: boolean;
  error: string | null;
  generatedEvent: EventResult | null;
  generationTime: number | null;
  reset: () => void;
}

export function useCreateEvent(): UseCreateEventResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEvent, setGeneratedEvent] = useState<EventResult | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const createEvent = async (
    request: EventCreateRequest
  ): Promise<EventCreateResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: EventCreateResponse = await response.json();
      setGeneratedEvent(data.event);
      setGenerationTime(data.generation_time_ms);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create event';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setGeneratedEvent(null);
    setGenerationTime(null);
  };

  return {
    createEvent,
    isLoading,
    error,
    generatedEvent,
    generationTime,
    reset,
  };
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch {
    return false;
  }
}
