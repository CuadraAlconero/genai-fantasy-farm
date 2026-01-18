import type { CharacterMood } from '../types/event';
import { MOOD_EMOJIS } from '../types/event';

interface CharacterPortraitProps {
  name: string;
  mood: CharacterMood;
  side: 'left' | 'right';
  isActive?: boolean;
}

export function CharacterPortrait({
  name,
  mood,
  side,
  isActive = false,
}: CharacterPortraitProps) {
  return (
    <div
      className={`flex flex-col items-center transition-all duration-500 ${
        isActive ? 'scale-110' : 'scale-100 opacity-70'
      }`}
    >
      {/* Portrait silhouette */}
      <div
        className={`relative w-20 h-20 rounded-full overflow-hidden border-4 transition-all duration-300 ${
          isActive
            ? 'border-[var(--color-gold)] shadow-lg shadow-[var(--color-gold)]/30'
            : 'border-[var(--color-wood)]'
        }`}
        style={{
          background: `linear-gradient(180deg, 
            ${side === 'left' ? 'var(--color-forest-light)' : 'var(--color-wood)'} 0%, 
            ${side === 'left' ? 'var(--color-forest)' : 'var(--color-wood-dark)'} 100%)`,
        }}
      >
        {/* Silhouette SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        >
          {/* Head */}
          <ellipse cx="50" cy="35" rx="20" ry="22" fill="rgba(0,0,0,0.4)" />
          {/* Neck */}
          <rect x="42" y="52" width="16" height="12" fill="rgba(0,0,0,0.4)" />
          {/* Shoulders */}
          <ellipse cx="50" cy="85" rx="35" ry="25" fill="rgba(0,0,0,0.4)" />
        </svg>

        {/* Active indicator glow */}
        {isActive && (
          <div className="absolute inset-0 bg-[var(--color-gold)]/20 animate-pulse" />
        )}
      </div>

      {/* Name */}
      <p
        className={`mt-2 font-semibold text-sm text-center transition-colors duration-300 ${
          isActive ? 'text-[var(--color-wood-dark)]' : 'text-[var(--color-stone)]'
        }`}
      >
        {name}
      </p>

      {/* Mood indicator */}
      <div
        className={`mt-1 px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-all duration-300 ${
          isActive
            ? 'bg-[var(--color-parchment-dark)] scale-110'
            : 'bg-[var(--color-parchment)]'
        }`}
      >
        <span className="text-base">{MOOD_EMOJIS[mood]}</span>
        <span className="text-[var(--color-ink-light)] capitalize">
          {mood.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}
