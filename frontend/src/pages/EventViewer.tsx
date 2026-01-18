import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../hooks/useEvents';
import { useCharacter } from '../hooks/useCharacters';
import { CharacterPortrait } from '../components/CharacterPortrait';
import { TurnDisplay } from '../components/TurnDisplay';
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
  MOOD_EMOJIS,
} from '../types/event';
import type { CharacterMood } from '../types/event';

export function EventViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { event, loading, error } = useEvent(id);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Load character data for names
  const { character: characterA } = useCharacter(event?.config.character_a_id);
  const { character: characterB } = useCharacter(event?.config.character_b_id);

  // Playback state
  const [currentTurnIndex, setCurrentTurnIndex] = useState(-1);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Current moods based on displayed turns
  const [currentMoodA, setCurrentMoodA] = useState<CharacterMood>('neutral');
  const [currentMoodB, setCurrentMoodB] = useState<CharacterMood>('neutral');

  // Initialize moods from config
  useEffect(() => {
    if (event) {
      setCurrentMoodA(event.config.character_a_mood);
      setCurrentMoodB(event.config.character_b_mood);
    }
  }, [event]);

  // Auto-scroll to bottom of transcript when new turns appear
  useEffect(() => {
    if (transcriptRef.current && currentTurnIndex >= 0) {
      // Small delay to ensure DOM has updated with new turn
      const timer = setTimeout(() => {
        if (transcriptRef.current) {
          transcriptRef.current.scrollTo({
            top: transcriptRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentTurnIndex]);

  // Handle advancing to next turn
  const handleAdvance = useCallback(() => {
    if (!event) return;

    const totalTurns = event.transcript.turns.length;

    // If not started, begin the event
    if (!hasStarted) {
      setHasStarted(true);
      setCurrentTurnIndex(0);
      const turn = event.transcript.turns[0];
      if (turn.speaker_id === event.config.character_a_id) {
        setCurrentMoodA(turn.mood);
      } else {
        setCurrentMoodB(turn.mood);
      }
      return;
    }

    // If already complete, do nothing
    if (isComplete) return;

    // Advance to next turn
    const nextIndex = currentTurnIndex + 1;
    if (nextIndex >= totalTurns) {
      // Event is complete
      setIsComplete(true);
      setCurrentMoodA(event.transcript.character_a_final_mood);
      setCurrentMoodB(event.transcript.character_b_final_mood);
    } else {
      setCurrentTurnIndex(nextIndex);
      const turn = event.transcript.turns[nextIndex];
      if (turn.speaker_id === event.config.character_a_id) {
        setCurrentMoodA(turn.mood);
      } else {
        setCurrentMoodB(turn.mood);
      }
    }
  }, [event, hasStarted, isComplete, currentTurnIndex]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAdvance]);

  const handleRestart = () => {
    if (!event) return;
    setCurrentTurnIndex(-1);
    setHasStarted(false);
    setIsComplete(false);
    setCurrentMoodA(event.config.character_a_mood);
    setCurrentMoodB(event.config.character_b_mood);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center">
        <div className="text-[var(--color-stone)] text-xl animate-pulse">
          Loading event...
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[var(--color-parchment)] flex flex-col items-center justify-center gap-4">
        <div className="text-red-600 text-xl">{error || 'Event not found'}</div>
        <button
          onClick={() => navigate('/events')}
          className="btn-fantasy"
        >
          ← Back to Events
        </button>
      </div>
    );
  }

  const characterAName = characterA?.name || 'Character A';
  const characterBName = characterB?.name || 'Character B';
  const activeSpeakerId =
    currentTurnIndex >= 0
      ? event.transcript.turns[currentTurnIndex]?.speaker_id
      : null;

  const totalTurns = event.transcript.turns.length;
  const turnsRemaining = totalTurns - currentTurnIndex - 1;

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/events')}
            className="fantasy-link"
          >
            ← Back to Events
          </button>
          <h1
            className="text-2xl md:text-3xl font-bold text-[var(--color-wood-dark)] flex items-center gap-2"
            style={{
              fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
            }}
          >
            <span>{EVENT_TYPE_ICONS[event.config.event_type]}</span>
            <span>{EVENT_TYPE_LABELS[event.config.event_type]}</span>
          </h1>
          <div className="w-24" />
        </div>

        {/* Event info */}
        <div className="card-fantasy mb-6 text-center">
          <p className="text-lg text-[var(--color-ink)]">
            {event.config.description}
          </p>
          <p className="text-sm text-[var(--color-stone)] mt-2">
            📍 {event.config.location} • 🌐 {event.config.language}
          </p>
        </div>

        {/* Main viewer - clickable area */}
        <div 
          className="card-fantasy overflow-hidden cursor-pointer select-none"
          onClick={handleAdvance}
        >
          {/* Character portraits header */}
          <div className="flex justify-between items-start p-4 bg-gradient-to-b from-[var(--color-parchment-dark)] to-transparent">
            <CharacterPortrait
              name={characterAName}
              mood={currentMoodA}
              side="left"
              isActive={activeSpeakerId === event.config.character_a_id}
            />

            <div className="flex flex-col items-center justify-center px-4">
              <span className="text-4xl mb-2">⚔️</span>
              <span className="text-sm text-[var(--color-stone)]">
                {hasStarted ? (
                  isComplete ? (
                    <span className="text-[var(--color-forest)] font-semibold">Complete</span>
                  ) : (
                    `Turn ${currentTurnIndex + 1} of ${totalTurns}`
                  )
                ) : (
                  'Ready to begin'
                )}
              </span>
            </div>

            <CharacterPortrait
              name={characterBName}
              mood={currentMoodB}
              side="right"
              isActive={activeSpeakerId === event.config.character_b_id}
            />
          </div>

          {/* Divider */}
          <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-wood)] to-transparent" />

          {/* Transcript area */}
          <div
            ref={transcriptRef}
            className="h-[400px] overflow-y-auto overscroll-contain p-4 space-y-2"
            style={{
              background:
                'repeating-linear-gradient(0deg, var(--color-parchment) 0px, var(--color-parchment) 28px, var(--color-parchment-dark) 28px, var(--color-parchment-dark) 29px)',
            }}
          >
            {!hasStarted ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--color-stone)]">
                <span className="text-6xl mb-4 animate-pulse">📜</span>
                <p className="text-xl font-semibold text-[var(--color-wood-dark)] mb-2">
                  The tale awaits...
                </p>
                <p className="text-[var(--color-ink-light)]">
                  Click anywhere or press <kbd className="px-2 py-1 bg-[var(--color-parchment-dark)] rounded border border-[var(--color-wood)] text-sm">Space</kbd> to begin
                </p>
              </div>
            ) : (
              <>
                {/* Render turns up to currentTurnIndex */}
                {event.transcript.turns.slice(0, currentTurnIndex + 1).map((turn, index) => (
                  <TurnDisplay
                    key={turn.turn_number}
                    turn={turn}
                    characterAId={event.config.character_a_id}
                    isVisible={true}
                    index={index}
                  />
                ))}

                {/* Summary (shown when complete) */}
                {isComplete && (
                  <div
                    className="mt-8 p-6 bg-gradient-to-b from-[var(--color-parchment-dark)] to-[var(--color-parchment)] rounded-lg border-2 border-[var(--color-gold)] shadow-lg animate-fadeIn"
                  >
                    <div className="text-center mb-4">
                      <span className="text-4xl">📖</span>
                    </div>
                    <h3 className="font-bold text-xl text-[var(--color-wood-dark)] mb-3 text-center">
                      ~ The End ~
                    </h3>
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mb-4" />
                    <p className="text-[var(--color-ink)] mb-4 italic text-center">
                      "{event.transcript.summary}"
                    </p>
                    <h4 className="font-semibold text-[var(--color-wood-dark)] mb-2">
                      What came to pass:
                    </h4>
                    <p className="text-[var(--color-ink-light)] mb-4">
                      {event.transcript.outcome}
                    </p>
                    <div className="flex justify-center gap-8 pt-4 border-t border-[var(--color-wood)]/30">
                      <div className="text-center">
                        <p className="font-semibold text-[var(--color-wood-dark)]">{characterAName}</p>
                        <p className="text-2xl">{MOOD_EMOJIS[event.transcript.character_a_final_mood]}</p>
                        <p className="text-sm text-[var(--color-stone)] capitalize">
                          {event.transcript.character_a_final_mood.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-[var(--color-wood-dark)]">{characterBName}</p>
                        <p className="text-2xl">{MOOD_EMOJIS[event.transcript.character_b_final_mood]}</p>
                        <p className="text-sm text-[var(--color-stone)] capitalize">
                          {event.transcript.character_b_final_mood.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom prompt area */}
          <div className="p-4 bg-[var(--color-parchment-dark)] border-t-2 border-[var(--color-wood)]">
            {!hasStarted ? (
              <div className="text-center">
                <button
                  onClick={(e) => { e.stopPropagation(); handleAdvance(); }}
                  className="btn-scroll group"
                >
                  <span className="btn-scroll-icon">📜</span>
                  <span>Unroll the Scroll</span>
                </button>
              </div>
            ) : isComplete ? (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={(e) => { e.stopPropagation(); handleRestart(); }}
                  className="btn-fantasy-secondary"
                >
                  <span className="mr-2">🔄</span>
                  Read Again
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate('/events'); }}
                  className="btn-fantasy"
                >
                  <span className="mr-2">📚</span>
                  More Tales
                </button>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={(e) => { e.stopPropagation(); handleAdvance(); }}
                  className="btn-continue group"
                >
                  <span className="btn-continue-text">Continue the tale...</span>
                  <span className="btn-continue-hint">
                    ({turnsRemaining} turn{turnsRemaining !== 1 ? 's' : ''} remaining)
                  </span>
                  <span className="btn-continue-icon">▼</span>
                </button>
                <p className="text-xs text-[var(--color-stone)] mt-2">
                  Click anywhere or press <kbd className="px-1.5 py-0.5 bg-[var(--color-parchment)] rounded border border-[var(--color-wood)]/50 text-xs">Space</kbd>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Generation info */}
        <div className="mt-4 text-center text-sm text-[var(--color-stone)]">
          Generated in {(event.generation_time_ms / 1000).toFixed(1)}s •{' '}
          {totalTurns} turns
        </div>

        {/* Restart button when in progress */}
        {hasStarted && !isComplete && (
          <div className="mt-4 text-center">
            <button
              onClick={handleRestart}
              className="text-[var(--color-stone)] hover:text-[var(--color-wood)] transition-colors text-sm"
            >
              🔄 Start over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
