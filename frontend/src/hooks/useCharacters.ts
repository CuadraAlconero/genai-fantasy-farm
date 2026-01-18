import { useState, useEffect, useCallback } from 'react';
import type { Character } from '../types/character';

const API_BASE = 'http://localhost:8000/api';

export function useCharacters() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCharacters = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/characters`);
            if (response.ok) {
                const data = await response.json();
                setCharacters(data);
            } else {
                setError(`Failed to fetch characters: ${response.statusText}`);
                setCharacters([]);
            }
        } catch (err) {
            setError('Failed to connect to API. Is the server running?');
            setCharacters([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCharacters();
    }, [fetchCharacters]);

    return { characters, loading, error, setCharacters, refetch: fetchCharacters };
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
                const response = await fetch(`${API_BASE}/characters/${id}`);
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

export async function deleteCharacter(id: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/characters/${id}`, {
            method: 'DELETE',
        });
        return response.ok;
    } catch {
        return false;
    }
}
