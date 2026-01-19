import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WizardStep } from '../components/WizardStep';
import { useCharacters } from '../hooks/useCharacters';
import { useCreateEvent } from '../hooks/useEvents';
import type { Character } from '../types/character';
import type {
  EventType,
  CharacterMood,
  EventCreateRequest,
} from '../types/event';
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_ICONS,
  MOOD_LABELS,
  MOOD_EMOJIS,
} from '../types/event';

type WizardStepId =
  | 'characters'
  | 'details'
  | 'moods'
  | 'settings'
  | 'review'
  | 'result';

const STEPS: WizardStepId[] = [
  'characters',
  'details',
  'moods',
  'settings',
  'review',
  'result',
];

const EVENT_TYPES: EventType[] = [
  'argument',
  'fight',
  'stealing',
  'romance',
  'trade',
  'gossip',
  'help',
  'celebration',
  'confrontation',
  'reconciliation',
];

const MOODS: CharacterMood[] = [
  'neutral',
  'happy',
  'angry',
  'sad',
  'scared',
  'nervous',
  'confident',
  'suspicious',
  'grateful',
  'jealous',
  'in_love',
];

const LOCATIONS = [
  'the village square',
  'the tavern',
  "the blacksmith's forge",
  'the market stalls',
  'the village well',
  "the herbalist's garden",
  'the mill',
  'the bridge over the creek',
  'the temple steps',
  "the farmer's field",
];

const LANGUAGES = [
  { value: 'spanish', label: 'Español' },
  { value: 'english', label: 'English' },
  { value: 'french', label: 'Français' },
  { value: 'german', label: 'Deutsch' },
  { value: 'italian', label: 'Italiano' },
  { value: 'portuguese', label: 'Português' },
];

interface FormData {
  character_a_id: string;
  character_b_id: string;
  event_type: EventType;
  description: string;
  location: string;
  character_a_mood: CharacterMood;
  character_b_mood: CharacterMood;
  character_a_target_mood: CharacterMood | null;
  character_b_target_mood: CharacterMood | null;
  min_interactions: number;
  max_interactions: number;
  language: string;
}

function CharacterSelector({
  characters,
  selectedId,
  otherId,
  onSelect,
  label,
}: {
  characters: Character[];
  selectedId: string;
  otherId: string;
  onSelect: (id: string) => void;
  label: string;
}) {
  return (
    <div>
      <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
        {label}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-[var(--color-parchment)] rounded-lg border-2 border-[var(--color-wood)]">
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char.id || '')}
            disabled={char.id === otherId}
            className={`p-3 rounded-lg text-left transition-all ${
              char.id === selectedId
                ? 'bg-[var(--color-forest)] text-white'
                : char.id === otherId
                  ? 'bg-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-[var(--color-parchment-dark)] hover:bg-[var(--color-wood)]/20'
            }`}
          >
            <p className="font-semibold">{char.name}</p>
            <p className="text-sm opacity-80">{char.skills.occupation}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function MoodSelector({
  value,
  onChange,
  label,
  allowNull = false,
}: {
  value: CharacterMood | null;
  onChange: (mood: CharacterMood | null) => void;
  label: string;
  allowNull?: boolean;
}) {
  return (
    <div>
      <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {allowNull && (
          <button
            onClick={() => onChange(null)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              value === null
                ? 'bg-[var(--color-forest)] text-white'
                : 'bg-[var(--color-parchment-dark)] hover:bg-[var(--color-wood)]/20'
            }`}
          >
            🎲 Random
          </button>
        )}
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => onChange(mood)}
            className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1 ${
              value === mood
                ? 'bg-[var(--color-forest)] text-white'
                : 'bg-[var(--color-parchment-dark)] hover:bg-[var(--color-wood)]/20'
            }`}
          >
            <span>{MOOD_EMOJIS[mood]}</span>
            <span>{MOOD_LABELS[mood]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CreateEvent() {
  const navigate = useNavigate();
  const { characters, loading: loadingChars } = useCharacters();
  const {
    createEvent,
    isLoading,
    error,
    generatedEvent,
    generationTime,
    reset,
  } = useCreateEvent();

  const [currentStep, setCurrentStep] = useState<WizardStepId>('characters');
  const [formData, setFormData] = useState<FormData>({
    character_a_id: '',
    character_b_id: '',
    event_type: 'argument',
    description: '',
    location: 'the village square',
    character_a_mood: 'neutral',
    character_b_mood: 'neutral',
    character_a_target_mood: null,
    character_b_target_mood: null,
    min_interactions: 3,
    max_interactions: 6,
    language: 'spanish',
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

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'characters':
        return !!formData.character_a_id && !!formData.character_b_id;
      case 'details':
        return !!formData.event_type && !!formData.description && !!formData.location;
      case 'moods':
        return true;
      case 'settings':
        return formData.min_interactions <= formData.max_interactions;
      default:
        return true;
    }
  };

  const handleGenerate = async () => {
    try {
      const request: EventCreateRequest = {
        character_a_id: formData.character_a_id,
        character_b_id: formData.character_b_id,
        event_type: formData.event_type,
        description: formData.description,
        location: formData.location,
        min_interactions: formData.min_interactions,
        max_interactions: formData.max_interactions,
        character_a_mood: formData.character_a_mood,
        character_b_mood: formData.character_b_mood,
        character_a_target_mood: formData.character_a_target_mood,
        character_b_target_mood: formData.character_b_target_mood,
        language: formData.language,
      };
      await createEvent(request);
      setCurrentStep('result');
    } catch {
      // Error handled in hook
    }
  };

  const handleStartOver = () => {
    reset();
    setFormData({
      character_a_id: '',
      character_b_id: '',
      event_type: 'argument',
      description: '',
      location: 'the village square',
      character_a_mood: 'neutral',
      character_b_mood: 'neutral',
      character_a_target_mood: null,
      character_b_target_mood: null,
      min_interactions: 3,
      max_interactions: 6,
      language: 'spanish',
    });
    setCurrentStep('characters');
  };

  const selectedCharA = characters.find((c) => c.id === formData.character_a_id);
  const selectedCharB = characters.find((c) => c.id === formData.character_b_id);

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/events')}
            className="text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
          >
            ← Back to Events
          </button>
          <h1
            className="text-3xl font-bold text-[var(--color-wood-dark)]"
            style={{
              fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
            }}
          >
            🎭 Create New Event
          </h1>
          <div className="w-32" />
        </div>

        {/* Divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-wood)] to-transparent mb-8" />

        {/* Wizard content */}
        <div className="card-fantasy">
          {/* Step 1: Select Characters */}
          {currentStep === 'characters' && (
            <WizardStep
              title="Select Characters"
              description="Choose two characters to participate in this event."
              stepNumber={1}
              totalSteps={6}
            >
              {loadingChars ? (
                <p className="text-[var(--color-stone)]">Loading characters...</p>
              ) : characters.length < 2 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--color-stone)] mb-4">
                    You need at least 2 characters to create an event.
                  </p>
                  <button
                    onClick={() => navigate('/characters/create')}
                    className="btn-fantasy"
                  >
                    Create Characters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <CharacterSelector
                    characters={characters}
                    selectedId={formData.character_a_id}
                    otherId={formData.character_b_id}
                    onSelect={(id) => setFormData({ ...formData, character_a_id: id })}
                    label="Character A"
                  />
                  <CharacterSelector
                    characters={characters}
                    selectedId={formData.character_b_id}
                    otherId={formData.character_a_id}
                    onSelect={(id) => setFormData({ ...formData, character_b_id: id })}
                    label="Character B"
                  />
                </div>
              )}
            </WizardStep>
          )}

          {/* Step 2: Event Details */}
          {currentStep === 'details' && (
            <WizardStep
              title="Event Details"
              description="Define what kind of event this will be."
              stepNumber={2}
              totalSteps={6}
            >
              <div className="space-y-6">
                {/* Event Type */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Event Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, event_type: type })}
                        className={`p-3 rounded-lg text-left transition-all flex items-center gap-2 ${
                          formData.event_type === type
                            ? 'bg-[var(--color-forest)] text-white'
                            : 'bg-[var(--color-parchment-dark)] hover:bg-[var(--color-wood)]/20'
                        }`}
                      >
                        <span className="text-xl">{EVENT_TYPE_ICONS[type]}</span>
                        <span>{EVENT_TYPE_LABELS[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe what triggers this event..."
                    className="w-full h-24 p-3 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] placeholder-[var(--color-stone)] focus:outline-none focus:border-[var(--color-forest)] resize-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Location
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-forest)]"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </WizardStep>
          )}

          {/* Step 3: Moods */}
          {currentStep === 'moods' && (
            <WizardStep
              title="Character Moods"
              description="Set the initial and target moods for each character."
              stepNumber={3}
              totalSteps={6}
            >
              <div className="space-y-8">
                {/* Character A */}
                <div className="p-4 bg-[var(--color-parchment-dark)] rounded-lg">
                  <h3 className="font-bold text-[var(--color-wood-dark)] mb-4">
                    {selectedCharA?.name || 'Character A'}
                  </h3>
                  <div className="space-y-4">
                    <MoodSelector
                      value={formData.character_a_mood}
                      onChange={(mood) =>
                        setFormData({
                          ...formData,
                          character_a_mood: mood || 'neutral',
                        })
                      }
                      label="Starting Mood"
                    />
                    <MoodSelector
                      value={formData.character_a_target_mood}
                      onChange={(mood) =>
                        setFormData({ ...formData, character_a_target_mood: mood })
                      }
                      label="Target Final Mood"
                      allowNull
                    />
                  </div>
                </div>

                {/* Character B */}
                <div className="p-4 bg-[var(--color-parchment-dark)] rounded-lg">
                  <h3 className="font-bold text-[var(--color-wood-dark)] mb-4">
                    {selectedCharB?.name || 'Character B'}
                  </h3>
                  <div className="space-y-4">
                    <MoodSelector
                      value={formData.character_b_mood}
                      onChange={(mood) =>
                        setFormData({
                          ...formData,
                          character_b_mood: mood || 'neutral',
                        })
                      }
                      label="Starting Mood"
                    />
                    <MoodSelector
                      value={formData.character_b_target_mood}
                      onChange={(mood) =>
                        setFormData({ ...formData, character_b_target_mood: mood })
                      }
                      label="Target Final Mood"
                      allowNull
                    />
                  </div>
                </div>
              </div>
            </WizardStep>
          )}

          {/* Step 4: Settings */}
          {currentStep === 'settings' && (
            <WizardStep
              title="Event Settings"
              description="Configure language and interaction limits."
              stepNumber={4}
              totalSteps={6}
            >
              <div className="space-y-6">
                {/* Language */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Language
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() =>
                          setFormData({ ...formData, language: lang.value })
                        }
                        className={`px-4 py-2 rounded-lg transition-all ${
                          formData.language === lang.value
                            ? 'bg-[var(--color-forest)] text-white'
                            : 'bg-[var(--color-parchment-dark)] hover:bg-[var(--color-wood)]/20'
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactions */}
                <div>
                  <label className="block font-semibold text-[var(--color-wood-dark)] mb-2">
                    Number of Interactions
                  </label>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-sm text-[var(--color-stone)]">Min</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={formData.min_interactions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            min_interactions: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-20 p-2 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-center"
                      />
                    </div>
                    <span className="text-[var(--color-stone)]">to</span>
                    <div>
                      <label className="text-sm text-[var(--color-stone)]">Max</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={formData.max_interactions}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_interactions: parseInt(e.target.value) || 6,
                          })
                        }
                        className="w-20 p-2 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </WizardStep>
          )}

          {/* Step 5: Review */}
          {currentStep === 'review' && (
            <WizardStep
              title="Review & Generate"
              description="Review your event configuration and generate."
              stepNumber={5}
              totalSteps={6}
            >
              <div className="space-y-4">
                <div className="p-4 bg-[var(--color-parchment-dark)] rounded-lg">
                  <h4 className="font-semibold text-[var(--color-wood-dark)] mb-2">
                    Summary
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <strong>Characters:</strong> {selectedCharA?.name} vs{' '}
                      {selectedCharB?.name}
                    </li>
                    <li>
                      <strong>Event:</strong>{' '}
                      {EVENT_TYPE_ICONS[formData.event_type]}{' '}
                      {EVENT_TYPE_LABELS[formData.event_type]}
                    </li>
                    <li>
                      <strong>Description:</strong> {formData.description}
                    </li>
                    <li>
                      <strong>Location:</strong> {formData.location}
                    </li>
                    <li>
                      <strong>Language:</strong>{' '}
                      {LANGUAGES.find((l) => l.value === formData.language)?.label}
                    </li>
                    <li>
                      <strong>Interactions:</strong> {formData.min_interactions} -{' '}
                      {formData.max_interactions}
                    </li>
                    <li>
                      <strong>Starting moods:</strong>{' '}
                      {MOOD_EMOJIS[formData.character_a_mood]} →{' '}
                      {MOOD_EMOJIS[formData.character_b_mood]}
                    </li>
                    {(formData.character_a_target_mood ||
                      formData.character_b_target_mood) && (
                      <li>
                        <strong>Target moods:</strong>{' '}
                        {formData.character_a_target_mood
                          ? MOOD_EMOJIS[formData.character_a_target_mood]
                          : '🎲'}{' '}
                        →{' '}
                        {formData.character_b_target_mood
                          ? MOOD_EMOJIS[formData.character_b_target_mood]
                          : '🎲'}
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
                  ⏱️ Generation typically takes 30-60 seconds depending on the
                  number of interactions.
                </p>

                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="btn-fantasy w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Generating event...
                    </span>
                  ) : (
                    '🎭 Generate Event'
                  )}
                </button>
              </div>
            </WizardStep>
          )}

          {/* Step 6: Result */}
          {currentStep === 'result' && generatedEvent && (
            <WizardStep title="Event Created!" description="" stepNumber={6} totalSteps={6}>
              <div className="space-y-6 text-center">
                {generationTime && (
                  <p className="text-sm text-[var(--color-forest)]">
                    ✓ Generated in {(generationTime / 1000).toFixed(1)} seconds
                  </p>
                )}

                <div className="p-6 bg-[var(--color-parchment-dark)] rounded-lg">
                  <span className="text-6xl">
                    {EVENT_TYPE_ICONS[generatedEvent.config.event_type]}
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-[var(--color-wood-dark)]">
                    {EVENT_TYPE_LABELS[generatedEvent.config.event_type]}
                  </h3>
                  <p className="mt-2 text-[var(--color-ink-light)]">
                    {generatedEvent.transcript.turns.length} turns generated
                  </p>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleStartOver} className="btn-fantasy flex-1">
                    🔄 Create Another
                  </button>
                  <button
                    onClick={() => navigate(`/events/${generatedEvent.id}`)}
                    className="btn-fantasy flex-1"
                    style={{
                      background:
                        'linear-gradient(180deg, var(--color-forest-light) 0%, var(--color-forest) 100%)',
                    }}
                  >
                    ▶️ Watch Event
                  </button>
                </div>
              </div>
            </WizardStep>
          )}

          {/* Navigation buttons */}
          {currentStep !== 'result' && currentStep !== 'review' && (
            <div className="flex justify-between mt-8 pt-6 border-t-2 border-[var(--color-wood)]">
              <button
                onClick={isFirstStep ? () => navigate('/events') : goBack}
                className="px-6 py-2 text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
              >
                {isFirstStep ? '← Cancel' : '← Back'}
              </button>

              <button
                onClick={goNext}
                disabled={!canProceed()}
                className="btn-fantasy disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}

          {/* Back button on review step */}
          {currentStep === 'review' && !isLoading && (
            <div className="flex justify-start mt-8 pt-6 border-t-2 border-[var(--color-wood)]">
              <button
                onClick={goBack}
                className="px-6 py-2 text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Start over on result page */}
          {isLastStep && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/events')}
                className="text-[var(--color-wood)] hover:text-[var(--color-forest)] transition-colors"
              >
                ← View All Events
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
