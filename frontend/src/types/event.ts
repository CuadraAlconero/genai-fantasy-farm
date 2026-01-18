// TypeScript interfaces matching Python event models

export type EventType =
  | 'argument'
  | 'fight'
  | 'stealing'
  | 'romance'
  | 'trade'
  | 'gossip'
  | 'help'
  | 'celebration'
  | 'confrontation'
  | 'reconciliation';

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  argument: 'Argument',
  fight: 'Fight',
  stealing: 'Stealing',
  romance: 'Romance',
  trade: 'Trade',
  gossip: 'Gossip',
  help: 'Help',
  celebration: 'Celebration',
  confrontation: 'Confrontation',
  reconciliation: 'Reconciliation',
};

export const EVENT_TYPE_ICONS: Record<EventType, string> = {
  argument: '💢',
  fight: '⚔️',
  stealing: '🦹',
  romance: '💕',
  trade: '🤝',
  gossip: '🗣️',
  help: '🤲',
  celebration: '🎉',
  confrontation: '😤',
  reconciliation: '🕊️',
};

export type CharacterMood =
  | 'angry'
  | 'scared'
  | 'in_love'
  | 'happy'
  | 'sad'
  | 'nervous'
  | 'confident'
  | 'suspicious'
  | 'grateful'
  | 'jealous'
  | 'neutral';

export const MOOD_LABELS: Record<CharacterMood, string> = {
  angry: 'Angry',
  scared: 'Scared',
  in_love: 'In Love',
  happy: 'Happy',
  sad: 'Sad',
  nervous: 'Nervous',
  confident: 'Confident',
  suspicious: 'Suspicious',
  grateful: 'Grateful',
  jealous: 'Jealous',
  neutral: 'Neutral',
};

export const MOOD_EMOJIS: Record<CharacterMood, string> = {
  angry: '😠',
  scared: '😨',
  in_love: '😍',
  happy: '😊',
  sad: '😢',
  nervous: '😰',
  confident: '😎',
  suspicious: '🤨',
  grateful: '🙏',
  jealous: '😒',
  neutral: '😐',
};

export interface EventConfig {
  description: string;
  event_type: EventType;
  location: string;
  timestamp: string;
  min_interactions: number;
  max_interactions: number;
  character_a_id: string;
  character_b_id: string;
  character_a_mood: CharacterMood;
  character_b_mood: CharacterMood;
  character_a_target_mood: CharacterMood | null;
  character_b_target_mood: CharacterMood | null;
  language: string;
}

export interface EventTurn {
  turn_number: number;
  speaker_id: string;
  speaker_name: string;
  dialogue: string | null;
  action: string | null;
  mood: CharacterMood;
  remaining_interactions: number;
}

export interface EventTranscript {
  turns: EventTurn[];
  summary: string;
  outcome: string;
  character_a_final_mood: CharacterMood;
  character_b_final_mood: CharacterMood;
}

export interface EventResult {
  id: string;
  config: EventConfig;
  transcript: EventTranscript;
  generated_at: string;
  generation_time_ms: number;
}

export interface EventCreateRequest {
  character_a_id: string;
  character_b_id: string;
  event_type: EventType;
  description: string;
  location: string;
  min_interactions?: number;
  max_interactions?: number;
  character_a_mood?: CharacterMood;
  character_b_mood?: CharacterMood;
  character_a_target_mood?: CharacterMood | null;
  character_b_target_mood?: CharacterMood | null;
  language?: string;
}

export interface EventCreateResponse {
  event: EventResult;
  generation_time_ms: number;
}
