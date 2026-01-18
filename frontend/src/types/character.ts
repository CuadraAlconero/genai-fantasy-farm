// TypeScript interfaces matching Python Pydantic models

export type Gender = 'male' | 'female';

export type Build = 'slim' | 'average' | 'athletic' | 'stocky' | 'heavy';

export type Temperament = 'choleric' | 'sanguine' | 'melancholic' | 'phlegmatic';

export const TEMPERAMENT_LABELS: Record<Temperament, string> = {
    choleric: 'Choleric - Ambitious Leader',
    sanguine: 'Sanguine - Social Optimist',
    melancholic: 'Melancholic - Thoughtful Analyst',
    phlegmatic: 'Phlegmatic - Calm Diplomat',
};

export interface Appearance {
    height_cm: number;
    build: Build;
    hair_color: string;
    hair_style: string;
    eye_color: string;
    skin_tone: string;
    distinguishing_features: string[];
    clothing_style: string;
}

export interface Personality {
    temperament: Temperament;
    positive_traits: string[];
    negative_traits: string[];
    quirks: string[];
    values: string[];
    fears: string[];
}

export interface LifeEvent {
    age_at_event: number;
    description: string;
}

export interface Backstory {
    origin_village: string;
    family_status: string;
    parents_occupation: string;
    reason_for_arrival: string;
    life_events: LifeEvent[];
    secrets: string[];
}

export interface StatBlock {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

export interface Skills {
    occupation: string;
    primary_skills: string[];
    secondary_skills: string[];
    stats: StatBlock;
    special_talent: string | null;
}

export interface Character {
    id: string | null;
    name: string;
    age: number;
    gender: Gender;
    appearance: Appearance;
    personality: Personality;
    backstory: Backstory;
    skills: Skills;
    portrait_description: string;
}
