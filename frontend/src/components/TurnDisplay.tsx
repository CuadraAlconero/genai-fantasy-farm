import type { EventTurn } from '../types/event';
import { SpeechBubble } from './SpeechBubble';

interface TurnDisplayProps {
  turn: EventTurn;
  characterAId: string;
  isVisible: boolean;
  index: number;
}

export function TurnDisplay({
  turn,
  characterAId,
}: TurnDisplayProps) {
  const isCharacterA = turn.speaker_id === characterAId;
  const side = isCharacterA ? 'left' : 'right';

  return (
    <div
      className="relative py-2 animate-fadeIn"
    >
      {/* Turn number indicator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 px-2 py-0.5 rounded-full bg-[var(--color-wood)] text-white text-xs animate-scaleIn"
      >
        {turn.turn_number}
      </div>

      {/* Speech bubble */}
      <SpeechBubble
        dialogue={turn.dialogue}
        action={turn.action}
        side={side}
        isVisible={true}
        animationDelay={100}
      />
    </div>
  );
}
