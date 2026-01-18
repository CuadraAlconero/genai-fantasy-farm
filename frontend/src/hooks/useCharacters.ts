import { useState, useEffect } from 'react';
import type { Character } from '../types/character';

// In production, this would be an API call
// For now, we'll load from a static JSON file or use sample data
export function useCharacters() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        async function loadCharacters() {
            try {
                // Try to load from the data directory
                const response = await fetch('/data/characters.json');
                if (response.ok) {
                    const data = await response.json();
                    setCharacters(Array.isArray(data) ? data : [data]);
                } else {
                    // If no file exists, return empty array
                    setCharacters([]);
                }
            } catch {
                // If loading fails, use empty array
                setCharacters([]);
            } finally {
                setLoading(false);
            }
        }

        loadCharacters();
    }, []);

    return { characters, loading, error, setCharacters };
}

export function useCharacter(id: string | undefined) {
    const [character, setCharacter] = useState<Character | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        async function loadCharacter() {
            try {
                const response = await fetch(`/data/${id}.json`);
                if (response.ok) {
                    const data = await response.json();
                    setCharacter(data);
                } else {
                    setError('Character not found');
                }
            } catch {
                setError('Failed to load character');
            } finally {
                setLoading(false);
            }
        }

        loadCharacter();
    }, [id]);

    return { character, loading, error };
}
