import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character } from '../types/character';
import { TEMPERAMENT_LABELS } from '../types/character';
import { useCharacters } from '../hooks/useCharacters';

// Sample character for demo (when no data is loaded)
const SAMPLE_CHARACTER: Character = {
    id: 'sample-1',
    name: 'Elena Thornwood',
    age: 28,
    gender: 'female',
    appearance: {
        height_cm: 168,
        build: 'athletic',
        hair_color: 'auburn',
        hair_style: 'long braided',
        eye_color: 'green',
        skin_tone: 'fair with freckles',
        distinguishing_features: ['small scar on left cheek', 'calloused hands'],
        clothing_style: 'practical herbalist robes with many pockets',
    },
    personality: {
        temperament: 'melancholic',
        positive_traits: ['compassionate', 'meticulous', 'patient'],
        negative_traits: ['perfectionist', 'worrier'],
        quirks: ['talks to plants', 'collects unusual stones'],
        values: ['knowledge', 'healing', 'nature'],
        fears: ['losing her garden', 'being unable to help someone in need'],
    },
    backstory: {
        origin_village: 'Willowmere',
        family_status: 'only child of a healer',
        parents_occupation: 'village healer and apothecary',
        reason_for_arrival: 'seeking rare herbs rumored to grow in the nearby forest',
        life_events: [
            { age_at_event: 12, description: 'Saved a child with a fever using herbs she gathered herself' },
            { age_at_event: 20, description: 'Her mother passed away, leaving her the family healing tome' },
        ],
        secrets: ['carries a letter from a mysterious benefactor'],
    },
    skills: {
        occupation: 'herbalist',
        primary_skills: ['plant identification', 'potion brewing', 'first aid'],
        secondary_skills: ['foraging', 'reading ancient texts'],
        stats: {
            strength: 4,
            dexterity: 6,
            constitution: 5,
            intelligence: 8,
            wisdom: 9,
            charisma: 6,
        },
        special_talent: 'can sense the medicinal properties of plants by touch',
    },
    portrait_description: 'A young woman with striking auburn hair woven into a practical braid, her green eyes reflecting both curiosity and compassion. Freckles dust her fair cheeks, and a small scar near her left eye hints at past adventures. She wears earth-toned robes with countless pockets, each holding dried herbs, small vials, or mysterious seeds.',
};

interface CharacterCardProps {
    character: Character;
    onClick: () => void;
}

function CharacterCard({ character, onClick }: CharacterCardProps) {
    return (
        <button
            onClick={onClick}
            className="card-fantasy text-left w-full hover:scale-[1.02] transition-all duration-200"
        >
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-wood)] flex items-center justify-center text-2xl">
                    {character.gender === 'male' ? '👨' : '👩'}
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--color-wood-dark)]">
                        {character.name}
                    </h3>
                    <p className="text-[var(--color-forest)]">
                        {character.skills.occupation} • {character.age} years old
                    </p>
                    <p className="text-sm text-[var(--color-ink-light)] mt-1">
                        {TEMPERAMENT_LABELS[character.personality.temperament]}
                    </p>
                </div>
            </div>
        </button>
    );
}

interface CharacterDetailProps {
    character: Character;
    onClose: () => void;
}

function StatBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
    const percentage = (value / max) * 100;
    return (
        <div className="flex items-center gap-2">
            <span className="w-12 text-sm font-semibold text-[var(--color-ink-light)]">{label}</span>
            <div className="flex-1 h-4 bg-[var(--color-parchment-dark)] rounded overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[var(--color-forest)] to-[var(--color-forest-light)]"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="w-6 text-sm font-bold text-[var(--color-wood-dark)]">{value}</span>
        </div>
    );
}

function CharacterDetail({ character, onClose }: CharacterDetailProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'personality' | 'backstory' | 'skills'>('overview');

    const tabs = [
        { id: 'overview' as const, label: '📋 Overview' },
        { id: 'personality' as const, label: '🎭 Personality' },
        { id: 'backstory' as const, label: '📜 Backstory' },
        { id: 'skills' as const, label: '⚔️ Skills' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card-fantasy max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-wood)] flex items-center justify-center text-4xl">
                            {character.gender === 'male' ? '👨' : '👩'}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-[var(--color-wood-dark)]">
                                {character.name}
                            </h2>
                            <p className="text-lg text-[var(--color-forest)]">
                                {character.skills.occupation} • {character.age} years old • {character.gender}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-2xl text-[var(--color-stone)] hover:text-[var(--color-ink)] transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b-2 border-[var(--color-wood)]">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 font-semibold transition-colors ${activeTab === tab.id
                                ? 'text-[var(--color-forest)] border-b-2 border-[var(--color-forest)] -mb-[2px]'
                                : 'text-[var(--color-stone)] hover:text-[var(--color-ink)]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="min-h-[300px]">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Portrait description */}
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">Portrait</h3>
                                <p className="text-[var(--color-ink-light)] italic leading-relaxed">
                                    "{character.portrait_description}"
                                </p>
                            </div>

                            {/* Appearance */}
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">Appearance</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p><strong>Height:</strong> {character.appearance.height_cm} cm</p>
                                    <p><strong>Build:</strong> {character.appearance.build}</p>
                                    <p><strong>Hair:</strong> {character.appearance.hair_color}, {character.appearance.hair_style}</p>
                                    <p><strong>Eyes:</strong> {character.appearance.eye_color}</p>
                                    <p><strong>Skin:</strong> {character.appearance.skin_tone}</p>
                                    <p><strong>Clothing:</strong> {character.appearance.clothing_style}</p>
                                </div>
                                {character.appearance.distinguishing_features.length > 0 && (
                                    <p className="mt-2 text-sm">
                                        <strong>Distinguishing features:</strong> {character.appearance.distinguishing_features.join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'personality' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">Temperament</h3>
                                <p className="text-[var(--color-forest)] font-semibold">
                                    {TEMPERAMENT_LABELS[character.personality.temperament]}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">✨ Positive Traits</h3>
                                    <ul className="list-disc list-inside text-[var(--color-forest)]">
                                        {character.personality.positive_traits.map((trait, i) => (
                                            <li key={i}>{trait}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">⚠️ Flaws</h3>
                                    <ul className="list-disc list-inside text-[var(--color-ink-light)]">
                                        {character.personality.negative_traits.map((trait, i) => (
                                            <li key={i}>{trait}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">💎 Values</h3>
                                <p>{character.personality.values.join(' • ')}</p>
                            </div>

                            {character.personality.quirks.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">🎪 Quirks</h3>
                                    <ul className="list-disc list-inside">
                                        {character.personality.quirks.map((quirk, i) => (
                                            <li key={i}>{quirk}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {character.personality.fears.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">😰 Fears</h3>
                                    <ul className="list-disc list-inside text-[var(--color-ink-light)]">
                                        {character.personality.fears.map((fear, i) => (
                                            <li key={i}>{fear}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'backstory' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">🏘️ Origin</h3>
                                    <p>{character.backstory.origin_village}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">👨‍👩‍👧 Family</h3>
                                    <p>{character.backstory.family_status}</p>
                                    <p className="text-sm text-[var(--color-ink-light)]">Parents: {character.backstory.parents_occupation}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">🚶 Reason for Arrival</h3>
                                <p>{character.backstory.reason_for_arrival}</p>
                            </div>

                            {character.backstory.life_events.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">📖 Life Events</h3>
                                    <div className="space-y-2">
                                        {character.backstory.life_events.map((event, i) => (
                                            <div key={i} className="flex gap-4 items-start">
                                                <span className="font-bold text-[var(--color-forest)] whitespace-nowrap">
                                                    Age {event.age_at_event}:
                                                </span>
                                                <span>{event.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {character.backstory.secrets.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">🤫 Secrets</h3>
                                    <ul className="list-disc list-inside text-[var(--color-ink-light)] italic">
                                        {character.backstory.secrets.map((secret, i) => (
                                            <li key={i}>{secret}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">💼 Occupation</h3>
                                <p className="text-xl text-[var(--color-forest)] font-semibold capitalize">
                                    {character.skills.occupation}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">🎯 Primary Skills</h3>
                                    <ul className="list-disc list-inside">
                                        {character.skills.primary_skills.map((skill, i) => (
                                            <li key={i}>{skill}</li>
                                        ))}
                                    </ul>
                                </div>
                                {character.skills.secondary_skills.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">📚 Secondary Skills</h3>
                                        <ul className="list-disc list-inside">
                                            {character.skills.secondary_skills.map((skill, i) => (
                                                <li key={i}>{skill}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {character.skills.special_talent && (
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-2">⭐ Special Talent</h3>
                                    <p className="text-[var(--color-gold)] italic">{character.skills.special_talent}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-wood-dark)] mb-4">📊 Stats</h3>
                                <div className="space-y-3">
                                    <StatBar label="STR" value={character.skills.stats.strength} />
                                    <StatBar label="DEX" value={character.skills.stats.dexterity} />
                                    <StatBar label="CON" value={character.skills.stats.constitution} />
                                    <StatBar label="INT" value={character.skills.stats.intelligence} />
                                    <StatBar label="WIS" value={character.skills.stats.wisdom} />
                                    <StatBar label="CHA" value={character.skills.stats.charisma} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function Characters() {
    const navigate = useNavigate();
    const { characters: loadedCharacters, loading } = useCharacters();
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Use loaded characters or sample if none
    const characters = loadedCharacters.length > 0 ? loadedCharacters : [SAMPLE_CHARACTER];

    // Filter characters by search
    const filteredCharacters = characters.filter((char) =>
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.skills.occupation.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-[var(--color-wood-dark)]"
                        style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" }}>
                        👥 Village Characters
                    </h1>
                    <div className="w-32" />
                </div>

                {/* Divider */}
                <div className="h-1 bg-gradient-to-r from-transparent via-[var(--color-wood)] to-transparent mb-8" />

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search by name or occupation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-md px-4 py-2 rounded-lg border-2 border-[var(--color-wood)] bg-[var(--color-parchment)] text-[var(--color-ink)] placeholder-[var(--color-stone)] focus:outline-none focus:border-[var(--color-forest)]"
                    />
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="text-center py-12">
                        <p className="text-[var(--color-stone)]">Loading characters...</p>
                    </div>
                )}

                {/* Character grid */}
                {!loading && (
                    <>
                        <p className="mb-4 text-[var(--color-stone)]">
                            {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''} found
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCharacters.map((character) => (
                                <CharacterCard
                                    key={character.id}
                                    character={character}
                                    onClick={() => setSelectedCharacter(character)}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Empty state */}
                {!loading && filteredCharacters.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-[var(--color-stone)]">No characters found.</p>
                        <p className="text-[var(--color-ink-light)] mt-2">
                            Try a different search or generate new characters using the CLI.
                        </p>
                    </div>
                )}

                {/* Create character button */}
                <div className="mt-12 card-fantasy text-center">
                    <p className="text-[var(--color-ink-light)] mb-4">
                        Ready to bring a new villager to life?
                    </p>
                    <button
                        onClick={() => navigate('/characters/create')}
                        className="btn-fantasy text-lg"
                    >
                        ✨ Create New Character
                    </button>
                </div>
            </div>

            {/* Character detail modal */}
            {selectedCharacter && (
                <CharacterDetail
                    character={selectedCharacter}
                    onClose={() => setSelectedCharacter(null)}
                />
            )}
        </div>
    );
}
