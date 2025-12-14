export enum Gender {
  Male = 'Hombre',
  Female = 'Mujer',
}

export enum Accent {
  Spain = 'España',
  Mexico = 'México',
  Argentina = 'Argentina',
  Peru = 'Perú',
  Colombia = 'Colombia',
}

export enum Style {
  Natural = 'Natural',
  Joyful = 'Alegre',
  Sad = 'Triste',
  Whisper = 'Susurrar',
  Storyteller = 'Storyteller',
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: Gender;
  geminiVoice: string; // Internal mapping to Gemini prebuilt voices
  baseToneDescription: string;
}

export interface GenerationSettings {
  voiceId: string;
  accent: Accent;
  style: Style;
  speed: number; // 0.5 to 2.0
  pitch: number; // -10 to 10 arbitrary scale
  text: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  textSnippet: string;
  settings: Omit<GenerationSettings, 'text'>;
  audioUrl: string;
  duration?: number;
}
