import type { ReactNode } from 'react';

interface WizardStepProps {
  title: string;
  description?: string;
  children: ReactNode;
  stepNumber: number;
  totalSteps: number;
}

export function WizardStep({ title, description, children, stepNumber, totalSteps }: WizardStepProps) {
  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[var(--color-forest)] text-[var(--color-parchment)] flex items-center justify-center font-bold">
            {stepNumber}
          </span>
          <span className="text-sm text-[var(--color-stone)]">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>
        {/* Progress bar */}
        <div className="flex-1 mx-4 h-2 bg-[var(--color-parchment-dark)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--color-forest)] transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-wood-dark)] mb-2">{title}</h2>
        {description && (
          <p className="text-[var(--color-ink-light)] mb-4">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
