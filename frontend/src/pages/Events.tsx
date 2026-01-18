import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useCharacters } from '../hooks/useCharacters';
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
  MOOD_EMOJIS,
} from '../types/event';
import type { EventResult } from '../types/event';
import type { Character } from '../types/character';

interface EventCardProps {
  event: EventResult;
  characterA: Character | undefined;
  characterB: Character | undefined;
  onClick: () => void;
}

function EventCard({ event, characterA, characterB, onClick }: EventCardProps) {
  const date = new Date(event.generated_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      onClick={onClick}
      className="card-fantasy text-left w-full hover:scale-[1.02] transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        {/* Event type icon */}
        <div className="w-14 h-14 rounded-full bg-[var(--color-wood)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
          {EVENT_TYPE_ICONS[event.config.event_type]}
        </div>

        <div className="flex-1 min-w-0">
          {/* Event type and date */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-[var(--color-wood-dark)]">
              {EVENT_TYPE_LABELS[event.config.event_type]}
            </h3>
            <span className="text-xs text-[var(--color-stone)]">{formattedDate}</span>
          </div>

          {/* Participants */}
          <p className="text-[var(--color-forest)] text-sm mb-2">
            {characterA?.name || 'Unknown'} vs {characterB?.name || 'Unknown'}
          </p>

          {/* Description */}
          <p className="text-sm text-[var(--color-ink-light)] line-clamp-2">
            {event.config.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-stone)]">
            <span>📍 {event.config.location}</span>
            <span>💬 {event.transcript.turns.length} turns</span>
            <span>
              {MOOD_EMOJIS[event.transcript.character_a_final_mood]} →{' '}
              {MOOD_EMOJIS[event.transcript.character_b_final_mood]}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function Events() {
  const navigate = useNavigate();
  const [filterCharacterId, setFilterCharacterId] = useState<string | undefined>(
    undefined
  );
  const { events, loading, error, refetch } = useEvents(filterCharacterId);
  const { characters } = useCharacters();

  // Create a map for quick character lookup
  const characterMap = new Map(characters.map((c) => [c.id, c]));

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1
            className="text-3xl font-bold text-[var(--color-wood-dark)]"
            style={{
              fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
            }}
          >
            📜 Village Events
          </h1>
          <div className="w-32" />
        </div>

        {/* Divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-wood)] to-transparent mb-8" />

        {/* Actions bar */}
        <div className="card-fantasy mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Character filter */}
            <div className="flex items-center gap-3">
              <label className="text-[var(--color-ink-light)]">
                Filter by character:
              </label>
              <select
                value={filterCharacterId || ''}
                onChange={(e) => {
                  setFilterCharacterId(e.target.value || undefined);
                }}
                className="p-2 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-forest)]"
              >
                <option value="">All Characters</option>
                {characters.map((char) => (
                  <option key={char.id} value={char.id || ''}>
                    {char.name}
                  </option>
                ))}
              </select>
              {filterCharacterId && (
                <button
                  onClick={() => setFilterCharacterId(undefined)}
                  className="text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors"
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Create button */}
            <button
              onClick={() => navigate('/events/create')}
              className="btn-fantasy whitespace-nowrap"
            >
              🎭 Create New Event
            </button>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl animate-bounce mb-4">🎭</div>
            <p className="text-[var(--color-stone)]">Loading events...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="card-fantasy text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={refetch} className="btn-fantasy">
              Try Again
            </button>
          </div>
        )}

        {/* Events list */}
        {!loading && !error && (
          <>
            <p className="mb-4 text-[var(--color-stone)]">
              {events.length} event{events.length !== 1 ? 's' : ''} found
              {filterCharacterId && (
                <span>
                  {' '}
                  involving{' '}
                  <strong>
                    {characterMap.get(filterCharacterId)?.name || 'Unknown'}
                  </strong>
                </span>
              )}
            </p>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    characterA={characterMap.get(event.config.character_a_id)}
                    characterB={characterMap.get(event.config.character_b_id)}
                    onClick={() => navigate(`/events/${event.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="card-fantasy text-center py-12">
                <span className="text-6xl mb-4 block">🎭</span>
                <p className="text-xl text-[var(--color-stone)] mb-4">
                  No events yet
                </p>
                <p className="text-[var(--color-ink-light)] mb-6">
                  Create your first event to see character interactions come to
                  life!
                </p>
                <button
                  onClick={() => navigate('/events/create')}
                  className="btn-fantasy"
                >
                  🎭 Create First Event
                </button>
              </div>
            )}
          </>
        )}

        {/* Info footer */}
        <div className="mt-12 card-fantasy text-center">
          <p className="text-[var(--color-ink-light)]">
            💡 <strong>Tip:</strong> Events are generated using AI and feature
            dynamic dialogue between characters based on their personalities and
            moods.
          </p>
        </div>
      </div>
    </div>
  );
}
