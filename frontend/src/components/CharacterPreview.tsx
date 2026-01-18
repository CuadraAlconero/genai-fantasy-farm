import type { Character } from '../types/character';
import { TEMPERAMENT_LABELS } from '../types/character';

interface CharacterPreviewProps {
  character: Character;
}

export function CharacterPreview({ character }: CharacterPreviewProps) {
  return (
    <div className="card-fantasy">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-[var(--color-wood)] flex items-center justify-center text-3xl">
          {character.gender === 'male' ? '👨' : '👩'}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[var(--color-wood-dark)]">
            {character.name}
          </h3>
          <p className="text-[var(--color-forest)]">
            {character.skills.occupation} • {character.age} years old
          </p>
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="font-semibold text-[var(--color-wood-dark)] mb-1">Temperament</h4>
          <p className="text-sm">{TEMPERAMENT_LABELS[character.personality.temperament]}</p>
        </div>
        <div>
          <h4 className="font-semibold text-[var(--color-wood-dark)] mb-1">Origin</h4>
          <p className="text-sm">{character.backstory.origin_village}</p>
        </div>
        <div>
          <h4 className="font-semibold text-[var(--color-wood-dark)] mb-1">Positive Traits</h4>
          <p className="text-sm">{character.personality.positive_traits.join(', ')}</p>
        </div>
        <div>
          <h4 className="font-semibold text-[var(--color-wood-dark)] mb-1">Primary Skills</h4>
          <p className="text-sm">{character.skills.primary_skills.join(', ')}</p>
        </div>
      </div>

      {/* Portrait description */}
      <div className="border-t-2 border-[var(--color-wood)] pt-4">
        <h4 className="font-semibold text-[var(--color-wood-dark)] mb-2">Portrait</h4>
        <p className="text-sm text-[var(--color-ink-light)] italic leading-relaxed">
          "{character.portrait_description}"
        </p>
      </div>

      {/* Stats bar */}
      <div className="mt-4 pt-4 border-t-2 border-[var(--color-wood)]">
        <h4 className="font-semibold text-[var(--color-wood-dark)] mb-2">Stats</h4>
        <div className="flex gap-4 text-sm">
          <span>STR: {character.skills.stats.strength}</span>
          <span>DEX: {character.skills.stats.dexterity}</span>
          <span>CON: {character.skills.stats.constitution}</span>
          <span>INT: {character.skills.stats.intelligence}</span>
          <span>WIS: {character.skills.stats.wisdom}</span>
          <span>CHA: {character.skills.stats.charisma}</span>
        </div>
      </div>
    </div>
  );
}
