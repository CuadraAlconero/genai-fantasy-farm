interface SpeechBubbleProps {
  dialogue: string | null;
  action: string | null;
  side: 'left' | 'right';
  isVisible: boolean;
  animationDelay?: number;
}

export function SpeechBubble({
  dialogue,
  action,
  side,
  isVisible,
  animationDelay = 0,
}: SpeechBubbleProps) {
  if (!dialogue && !action) return null;

  return (
    <div
      className={`flex ${side === 'left' ? 'justify-start' : 'justify-end'} mb-4`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translateY(0) scale(1)'
          : `translateY(20px) scale(0.95)`,
        transition: `all 0.5s ease-out ${animationDelay}ms`,
      }}
    >
      <div
        className={`relative max-w-[70%] ${
          side === 'left' ? 'ml-4' : 'mr-4'
        }`}
      >
        {/* Speech bubble */}
        {dialogue && (
          <div
            className={`relative p-4 rounded-2xl shadow-md ${
              side === 'left'
                ? 'bg-[var(--color-forest-light)] text-white rounded-bl-sm'
                : 'bg-[var(--color-parchment-dark)] text-[var(--color-ink)] rounded-br-sm'
            }`}
          >
            {/* Tail */}
            <div
              className={`absolute bottom-0 w-4 h-4 ${
                side === 'left'
                  ? '-left-2 bg-[var(--color-forest-light)]'
                  : '-right-2 bg-[var(--color-parchment-dark)]'
              }`}
              style={{
                clipPath:
                  side === 'left'
                    ? 'polygon(100% 0, 100% 100%, 0 100%)'
                    : 'polygon(0 0, 100% 100%, 0 100%)',
              }}
            />

            {/* Dialogue text */}
            <p className="text-base leading-relaxed italic">"{dialogue}"</p>
          </div>
        )}

        {/* Action description */}
        {action && (
          <p
            className={`mt-2 text-sm text-[var(--color-stone)] italic ${
              side === 'left' ? 'text-left' : 'text-right'
            }`}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: `all 0.4s ease-out ${animationDelay + 200}ms`,
            }}
          >
            *{action}*
          </p>
        )}
      </div>
    </div>
  );
}
