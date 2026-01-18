import { useState } from 'react';
import type { Character, Temperament } from '../types/character';

const API_BASE = 'http://localhost:8000/api';

export interface CharacterCreateRequest {
  description?: string;
  name_hint?: string;
  occupation_hint?: string;
  temperament_hint?: Temperament;
  age_min?: number;
  age_max?: number;
}

export interface CharacterCreateResponse {
  character: Character;
  generation_time_ms: number;
}

export interface UseCreateCharacterResult {
  createCharacter: (request: CharacterCreateRequest) => Promise<CharacterCreateResponse>;
  isLoading: boolean;
  error: string | null;
  generatedCharacter: Character | null;
  generationTime: number | null;
  reset: () => void;
}

export function useCreateCharacter(): UseCreateCharacterResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCharacter, setGeneratedCharacter] = useState<Character | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const createCharacter = async (request: CharacterCreateRequest): Promise<CharacterCreateResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: CharacterCreateResponse = await response.json();
      setGeneratedCharacter(data.character);
      setGenerationTime(data.generation_time_ms);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create character';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setGeneratedCharacter(null);
    setGenerationTime(null);
  };

  return {
    createCharacter,
    isLoading,
    error,
    generatedCharacter,
    generationTime,
    reset,
  };
}
