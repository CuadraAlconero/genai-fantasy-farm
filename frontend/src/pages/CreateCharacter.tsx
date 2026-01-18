import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardStep } from '../components/WizardStep';
import { CharacterPreview } from '../components/CharacterPreview';
import { useCreateCharacter } from '../hooks/useCreateCharacter';
import type { CharacterCreateRequest } from '../hooks/useCreateCharacter';
import type { Temperament } from '../types/character';
import { TEMPERAMENT_LABELS } from '../types/character';

type WizardStepId = 'concept' | 'hints' | 'review' | 'result';

const STEPS: WizardStepId[] = ['concept', 'hints', 'review', 'result'];

const OCCUPATIONS = [
  'farmer',
  'blacksmith',
  'herbalist',
  'merchant',
  'innkeeper',
  'carpenter',
  'hunter',
  'baker',
  'weaver',
  'shepherd',
];

export function CreateCharacter() {
  const navigate = useNavigate();
  const { createCharacter, isLoading, error, generatedCharacter, generationTime, reset } = useCreateCharacter();

  const [currentStep, setCurrentStep] = useState<WizardStepId>('concept');
  const [formData, setFormData] = useState<CharacterCreateRequest>({
    description: '',
    name_hint: '',
    occupation_hint: '',
    temperament_hint: undefined,
    age_min: undefined,
    age_max: undefined,
  });

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStep === 'result';

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  const handleGenerate = async () => {
    try {
      await createCharacter(formData);
      setCurrentStep('result');
    } catch {
      // Error is handled in the hook
    }
  };

  const handleRegenerate = () => {
    reset();
    setCurrentStep('review');
  };

  const handleStartOver = () => {
    reset();
    setFormData({
      description: '',
      name_hint: '',
      occupation_hint: '',
      temperament_hint: undefined,
      age_min: undefined,
      age_max: undefined,
    });
    setCurrentStep('concept');
  };

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/characters')}
            className="text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
          >
            ← Back to Characters
          </button>
          <h1
            className="text-3xl font-bold text-[var(--color-wood-dark)]"
            style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}
          >
            ✨ Create New Character
          </h1>
          <div className="w-32" />
        </div>

        {/* Divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-wood)] to-transparent mb-8" />

        {/* Wizard content */}
        <div className="card-fantasy">
          {/* Step 1: Concept */}
          {currentStep === 'concept' && (
            <WizardStep
              title="Character Concept"
              description="Describe the character you'd like to create. Be as detailed or vague as you like - the AI will fill in the rest!"
              stepNumber={1}
              totalSteps={4}
            >
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., A mysterious herbalist who arrived from the eastern mountains, seeking rare plants rumored to grow in the nearby forest..."
                className="w-full h-40 p-4 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] placeholder-[var(--color-stone)] focus:outline-none focus:border-[var(--color-forest)] resize-none"
              />
              <p className="text-sm text-[var(--color-stone)] mt-2">
                💡 Tip: Leave blank for a completely random character
              </p>
            </WizardStep>
          )}

          {/* Step 2: Hints */}
          {currentStep === 'hints' && (
            <WizardStep
              title="Optional Hints"
              description="Fine-tune your character with these optional preferences. All fields are optional."
              stepNumber={2}
              totalSteps={4}
            >
              <div className="space-y-6">
                {/* Name hint */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Name Suggestion
                  </label>
                  <input
                    type="text"
                    value={formData.name_hint || ''}
                    onChange={(e) => setFormData({ ...formData, name_hint: e.target.value })}
                    placeholder="e.g., Elena, Marcus, something elvish..."
                    className="w-full p-3 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] placeholder-[var(--color-stone)] focus:outline-none focus:border-[var(--color-forest)]"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Occupation
                  </label>
                  <select
                    value={formData.occupation_hint || ''}
                    onChange={(e) => setFormData({ ...formData, occupation_hint: e.target.value || undefined })}
                    className="w-full p-3 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-forest)]"
                  >
                    <option value="">Any occupation</option>
                    {OCCUPATIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ.charAt(0).toUpperCase() + occ.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperament */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Temperament
                  </label>
                  <select
                    value={formData.temperament_hint || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        temperament_hint: (e.target.value as Temperament) || undefined,
                      })
                    }
                    className="w-full p-3 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-forest)]"
                  >
                    <option value="">Any temperament</option>
                    {(Object.keys(TEMPERAMENT_LABELS) as Temperament[]).map((temp) => (
                      <option key={temp} value={temp}>
                        {TEMPERAMENT_LABELS[temp]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Age range */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Age Range
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={16}
                      max={100}
                      value={formData.age_min || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age_min: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Min"
                      className="w-24 p-3 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] placeholder-[var(--color-stone)] focus:outline-none focus:border-[var(--color-forest)]"
                    />
                    <span className="text-[var(--color-ink-light)]">to</span>
                    <input
                      type="number"
                      min={16}
                      max={100}
                      value={formData.age_max || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age_max: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="Max"
                      className="w-24 p-3 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] placeholder-[var(--color-stone)] focus:outline-none focus:border-[var(--color-forest)]"
                    />
                    <span className="text-[var(--color-stone)]">years old</span>
                  </div>
                </div>
              </div>
            </WizardStep>
          )}

          {/* Step 3: Review & Generate */}
          {currentStep === 'review' && (
            <WizardStep
              title="Review & Generate"
              description="Review your choices and generate the character."
              stepNumber={3}
              totalSteps={4}
            >
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-[var(--color-parchment-dark)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-wood-dark)] mb-2">Summary</h4>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <strong>Concept:</strong>{' '}
                      {formData.description || <span className="text-[var(--color-stone)]">Random character</span>}
                    </li>
                    {formData.name_hint && (
                      <li>
                        <strong>Name hint:</strong> {formData.name_hint}
                      </li>
                    )}
                    {formData.occupation_hint && (
                      <li>
                        <strong>Occupation:</strong> {formData.occupation_hint}
                      </li>
                    )}
                    {formData.temperament_hint && (
                      <li>
                        <strong>Temperament:</strong> {TEMPERAMENT_LABELS[formData.temperament_hint]}
                      </li>
                    )}
                    {(formData.age_min || formData.age_max) && (
                      <li>
                        <strong>Age:</strong>{' '}
                        {formData.age_min && formData.age_max
                          ? `${formData.age_min} - ${formData.age_max}`
                          : formData.age_min
                            ? `${formData.age_min}+`
                            : `Up to ${formData.age_max}`}
                      </li>
                    )}
                  </ul>
                </div>

                {error && (
                  <div className="p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-700">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <p className="text-sm text-[var(--color-stone)]">
                  ⏱️ Generation typically takes 10-30 seconds depending on the AI model.
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="btn-fantasy w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Generating character...
                  </span>
                ) : (
                  '✨ Generate Character'
                )}
              </button>
            </WizardStep>
          )}

          {/* Step 4: Result */}
          {currentStep === 'result' && generatedCharacter && (
            <WizardStep title="Character Created!" description="" stepNumber={4} totalSteps={4}>
              <div className="space-y-6">
                {generationTime && (
                  <p className="text-sm text-[var(--color-forest)]">
                    ✓ Generated in {(generationTime / 1000).toFixed(1)} seconds
                  </p>
                )}

                <CharacterPreview character={generatedCharacter} />

                <div className="flex gap-4">
                  <button onClick={handleRegenerate} className="btn-fantasy flex-1">
                    🔄 Regenerate
                  </button>
                  <button
                    onClick={() => navigate('/characters')}
                    className="btn-fantasy flex-1"
                    style={{
                      background: 'linear-gradient(180deg, var(--color-forest-light) 0%, var(--color-forest) 100%)',
                    }}
                  >
                    ✓ View All Characters
                  </button>
                </div>
              </div>
            </WizardStep>
          )}

          {/* Navigation buttons */}
          {currentStep !== 'result' && (
            <div className="flex justify-between mt-8 pt-6 border-t-2 border-[var(--color-wood)]">
              <button
                onClick={isFirstStep ? () => navigate('/characters') : goBack}
                className="px-6 py-2 text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
              >
                {isFirstStep ? '← Cancel' : '← Back'}
              </button>

              {currentStep !== 'review' && (
                <button onClick={goNext} className="btn-fantasy">
                  Next →
                </button>
              )}
            </div>
          )}

          {/* Start over button on result page */}
          {isLastStep && (
            <div className="mt-6 text-center">
              <button
                onClick={handleStartOver}
                className="text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
              >
                ← Create another character
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
